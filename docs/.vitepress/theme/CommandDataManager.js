class CommandDataManager extends EventTarget {
  constructor() {
    super();
    this.commands = [];
    this.searchIndex = null;
    this.cacheKey = 'commandDataCache';
    this.cacheVersion = 'v1';
  }

  on(event, callback) {
    this.addEventListener(event, (e) => callback(e.detail));
  }

  emit(event, data) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  async init(dataUrl) {
    try {
      const cached = this.loadFromCache();
      
      if (cached && cached.url === dataUrl && Array.isArray(cached.commands)) {
        this.commands = cached.commands;
        this.buildSearchIndex();
        this.emit('loaded-from-cache', { count: this.commands.length });
        return;
      }

      this.emit('loading-progress', { percent: 0 });
      
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
      }

      const text = await response.text();
      
      this.emit('loading-progress', { percent: 80 });

      if (!text || text.trim() === '') {
        throw new Error('Empty response');
      }
      
      try {
        const parsed = JSON.parse(text);
        this.commands = Array.isArray(parsed?.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);
      } catch (parseError) {
        console.error('CommandDataManager: JSON parse error', parseError);
        this.commands = [];
      }

      this.emit('loading-progress', { percent: 90 });

      this.buildSearchIndex();
      if (this.commands.length > 0) {
        this.saveToCache(dataUrl);
      }

      this.emit('loading-progress', { percent: 100 });
      this.emit('loading-complete', { count: this.commands.length });
    } catch (error) {
      console.error('CommandDataManager: Load error', error);
      this.clearCache();
      this.commands = [];
      this.emit('loading-complete', { count: 0, error: error.message });
    }
  }

  buildSearchIndex() {
    this.searchIndex = {};
    this.commands.forEach((cmd, idx) => {
      const searchText = [
        cmd.name || '',
        cmd.keyword || '',
        cmd.description || '',
        cmd.data?.cmd || '',
        cmd.dirPath || ''
      ].join(' ').toLowerCase();

      const words = searchText.split(/\s+/).filter(w => w.length > 1);
      words.forEach(word => {
        if (!this.searchIndex[word]) {
          this.searchIndex[word] = [];
        }
        this.searchIndex[word].push(idx);
      });
    });
  }

  search(query, options = {}) {
    const { limit = 100 } = options;

    if (!this.searchIndex) {
      return this.commands.slice(0, limit);
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t);
    if (terms.length === 0) {
      return this.commands.slice(0, limit);
    }

    const scores = {};
    terms.forEach(term => {
      Object.keys(this.searchIndex).forEach(word => {
        if (word.includes(term)) {
          this.searchIndex[word].forEach(idx => {
            scores[idx] = (scores[idx] || 0) + 1;
          });
        }
      });
    });

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([idx]) => this.commands[parseInt(idx)]);
  }

  getAllCommands() {
    return this.commands;
  }

  getCommand(id) {
    return this.commands.find(cmd => cmd.id === id);
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data && data.version === this.cacheVersion && data.commands) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Cache load failed, clearing:', e);
      try { localStorage.removeItem(this.cacheKey); } catch {}
    }
    return null;
  }

  saveToCache(dataUrl) {
    try {
      const data = {
        version: this.cacheVersion,
        url: dataUrl,
        commands: this.commands,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Cache save failed:', e);
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  }
}

const dataManager = new CommandDataManager();

export { dataManager, CommandDataManager };
