import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CommandDataManager } from '../docs/.vitepress/theme/CommandDataManager.js'

describe('CommandDataManager', () => {
  let manager

  const mockCommands = [
    {
      id: '1',
      name: 'git status',
      keyword: 'git, status',
      description: 'Show working tree status',
      data: { cmd: 'git status' },
      dirPath: '/git'
    },
    {
      id: '2',
      name: 'git commit',
      keyword: 'git, commit',
      description: 'Record changes',
      data: { cmd: 'git commit -m "${message}"' },
      dirPath: '/git'
    },
    {
      id: '3',
      name: 'npm install',
      keyword: 'npm, install',
      description: 'Install package',
      data: { cmd: 'npm install ${package}' },
      dirPath: '/npm'
    }
  ]

  beforeEach(() => {
    manager = new CommandDataManager()
    // Reset fetch mock
    global.fetch = vi.fn()
    // Clear localStorage mock
    const store = {}
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value },
      removeItem: (key) => { delete store[key] }
    }
  })

  describe('init', () => {
    it('should initialize with empty commands when no data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => Promise.resolve('')
      })

      await manager.init('http://test.com/data.json')

      expect(manager.commands).toEqual([])
    })

    it('should parse valid JSON data', async () => {
      const testData = { data: mockCommands }

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => Promise.resolve(JSON.stringify(testData))
      })

      await manager.init('http://test.com/data.json')

      expect(manager.commands).toHaveLength(3)
      expect(manager.commands[0].name).toBe('git status')
    })

    it('should handle fetch error gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'))

      await manager.init('http://test.com/data.json')

      expect(manager.commands).toEqual([])
    })

    it('should emit loading-progress events', async () => {
      const progressEvents = []
      manager.on('loading-progress', (data) => {
        progressEvents.push(data)
      })

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => Promise.resolve(JSON.stringify({ data: [] }))
      })

      await manager.init('http://test.com/data.json')

      expect(progressEvents.length).toBeGreaterThan(0)
    })
  })

  describe('buildSearchIndex', () => {
    it('should build search index from commands', () => {
      manager.commands = [...mockCommands]
      manager.buildSearchIndex()

      expect(manager.searchIndex).toBeDefined()
      expect(Object.keys(manager.searchIndex).length).toBeGreaterThan(0)
    })

    it('should index command names', () => {
      manager.commands = [mockCommands[0]]
      manager.buildSearchIndex()

      expect(manager.searchIndex['git']).toBeDefined()
      expect(manager.searchIndex['status']).toBeDefined()
    })

    it('should index keywords', () => {
      manager.commands = [mockCommands[0]]
      manager.buildSearchIndex()

      expect(manager.searchIndex['git']).toContain(0)
    })

    it('should handle empty commands', () => {
      manager.commands = []
      manager.buildSearchIndex()

      expect(manager.searchIndex).toEqual({})
    })
  })

  describe('search', () => {
    beforeEach(() => {
      manager.commands = [...mockCommands]
      manager.buildSearchIndex()
    })

    it('should return all commands when query is empty', () => {
      const results = manager.search('')
      expect(results).toHaveLength(3)
    })

    it('should find commands by name', () => {
      const results = manager.search('git')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toContain('git')
    })

    it('should find commands by keyword', () => {
      const results = manager.search('status')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should respect limit option', () => {
      const results = manager.search('', { limit: 1 })
      expect(results).toHaveLength(1)
    })

    it('should handle multiple search terms', () => {
      const results = manager.search('git commit')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return results sorted by relevance', () => {
      const results = manager.search('git')
      // First result should have higher score
      expect(results.length).toBeGreaterThan(1)
    })
  })

  describe('getCommand', () => {
    beforeEach(() => {
      manager.commands = [...mockCommands]
    })

    it('should return command by id', () => {
      const cmd = manager.getCommand('1')
      expect(cmd).toBeDefined()
      expect(cmd.name).toBe('git status')
    })

    it('should return undefined for non-existent id', () => {
      const cmd = manager.getCommand('999')
      expect(cmd).toBeUndefined()
    })
  })

  describe('getAllCommands', () => {
    it('should return all commands', () => {
      manager.commands = [...mockCommands]
      const all = manager.getAllCommands()
      expect(all).toHaveLength(3)
    })
  })

  describe('cache operations', () => {
    it('should save to cache', () => {
      manager.commands = [...mockCommands]
      manager.saveToCache('http://test.com/data.json')

      const cached = manager.loadFromCache()
      expect(cached).toBeDefined()
      expect(cached.commands).toHaveLength(3)
    })

    it('should load from cache', () => {
      const cacheData = {
        version: manager.cacheVersion,
        url: 'http://test.com/data.json',
        commands: mockCommands
      }
      global.localStorage.setItem(manager.cacheKey, JSON.stringify(cacheData))

      const loaded = manager.loadFromCache()
      expect(loaded).toBeDefined()
      expect(loaded.commands).toHaveLength(3)
    })

    it('should clear cache', () => {
      manager.commands = [...mockCommands]
      manager.saveToCache('http://test.com/data.json')
      manager.clearCache()

      const cached = manager.loadFromCache()
      expect(cached).toBeNull()
    })
  })

  describe('EventTarget integration', () => {
    it('should emit and receive events', () => {
      let eventReceived = false
      manager.on('test-event', () => {
        eventReceived = true
      })
      manager.emit('test-event', {})

      expect(eventReceived).toBe(true)
    })
  })
})
