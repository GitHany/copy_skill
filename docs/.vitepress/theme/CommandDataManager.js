class CommandDataManager extends EventTarget {
  constructor() {
    super();
    this.commands = [];
    this.searchIndex = null;
    this.cacheKey = 'commandDataCache';
    this.cacheVersion = 'v2'; // 升级缓存版本
    this._compiledRegexCache = new Map(); // 预编译正则缓存
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

      // 使用 Set 去重，每个词条只记录一次
      const words = new Set(searchText.split(/\s+/).filter(w => w.length > 1));
      words.forEach(word => {
        if (!this.searchIndex[word]) {
          this.searchIndex[word] = [];
        }
        this.searchIndex[word].push(idx);
      });
    });
  }

  // 获取或创建预编译正则
  _getCompiledRegex(term) {
    if (!this._compiledRegexCache.has(term)) {
      // 转义特殊字符并构建正则
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this._compiledRegexCache.set(term, new RegExp(escaped, 'gi'));
    }
    return this._compiledRegexCache.get(term);
  }

  // Top-K 排序算法：只保留分数最高的前 limit 个
  _topK(scores, limit) {
    const entries = Object.entries(scores);
    if (entries.length <= limit) {
      return entries.sort((a, b) => b[1] - a[1]);
    }
    // 使用部分排序找出 Top-K
    return entries.sort((a, b) => b[1] - a[1]).slice(0, limit);
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
    
    // 优化：使用预编译正则替代字符串 includes
    terms.forEach(term => {
      const regex = this._getCompiledRegex(term);
      // 只检查以搜索词开头的词条（更精确的匹配）
      const prefix = term;
      
      for (const word of Object.keys(this.searchIndex)) {
        // 前缀匹配优先于包含匹配
        if (word.startsWith(prefix) || word.includes(prefix)) {
          const indices = this.searchIndex[word];
          const weight = word.startsWith(prefix) ? 2 : 1; // 前缀匹配权重更高
          for (const idx of indices) {
            scores[idx] = (scores[idx] || 0) + weight;
          }
        }
      }
    });

    // 使用 Top-K 排序
    const sorted = this._topK(scores, limit);
    return sorted.map(([idx]) => this.commands[parseInt(idx)]);
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
      // 缓存保存失败，忽略
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch (e) {
      // 缓存清除失败，忽略
    }
    // 清除正则缓存
    this._compiledRegexCache.clear();
  }
}

const dataManager = new CommandDataManager();

export { dataManager, CommandDataManager };
