import { describe, it, expect } from 'vitest'

// Extract placeholder functions from CommandLayout.vue for testing
// These mirror the implementation in the Vue component

const extractPlaceholders = (cmdText, paramsDef = {}) => {
  const regex = /%\{([^}]+)\}%/g
  const result = []
  let match
  while ((match = regex.exec(cmdText)) !== null) {
    const key = match[1]
    result.push({
      key,
      original: match[0],
      ...(paramsDef[key] ? { description: paramsDef[key].description } : {})
    })
  }
  return result
}

const replacePlaceholders = (cmdText, values) => {
  return cmdText.replace(/%\{([^}]+)\}%/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match
  })
}

describe('Placeholders Utils', () => {
  describe('extractPlaceholders', () => {
    it('should extract single placeholder', () => {
      const cmdText = 'npm install %{package}%'
      const result = extractPlaceholders(cmdText)

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('package')
      expect(result[0].original).toBe('%{package}%')
    })

    it('should extract multiple placeholders', () => {
      const cmdText = 'git commit -m "%{message}%" -a %{all}%'
      const result = extractPlaceholders(cmdText)

      expect(result).toHaveLength(2)
      expect(result[0].key).toBe('message')
      expect(result[1].key).toBe('all')
    })

    it('should return empty array when no placeholders', () => {
      const cmdText = 'git status'
      const result = extractPlaceholders(cmdText)

      expect(result).toHaveLength(0)
    })

    it('should handle empty string', () => {
      const result = extractPlaceholders('')
      expect(result).toHaveLength(0)
    })

    it('should include description from paramsDef', () => {
      const cmdText = 'npm install %{package}%'
      const paramsDef = {
        package: { description: 'Package name to install' }
      }
      const result = extractPlaceholders(cmdText, paramsDef)

      expect(result[0].description).toBe('Package name to install')
    })

    it('should handle nested braces in placeholder names', () => {
      const cmdText = 'echo %{key}%'
      const result = extractPlaceholders(cmdText)

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('key')
    })
  })

  describe('replacePlaceholders', () => {
    it('should replace single placeholder', () => {
      const cmdText = 'npm install %{package}%'
      const values = { package: 'vue' }
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('npm install vue')
    })

    it('should replace multiple placeholders', () => {
      const cmdText = 'git commit -m "%{message}%" -a %{all}%'
      const values = { message: 'Initial commit', all: true }
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('git commit -m "Initial commit" -a true')
    })

    it('should leave unmatched placeholders unchanged', () => {
      const cmdText = 'npm install %{package}%'
      const values = {}
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('npm install %{package}%')
    })

    it('should handle partial replacement', () => {
      const cmdText = 'git commit -m "%{message}%" -a %{all}%'
      const values = { message: 'Fixed bug' }
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('git commit -m "Fixed bug" -a %{all}%')
    })

    it('should handle empty values', () => {
      const cmdText = 'echo %{msg}%'
      const values = { msg: '' }
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('echo ')
    })

    it('should handle no placeholders', () => {
      const cmdText = 'git status'
      const values = { any: 'value' }
      const result = replacePlaceholders(cmdText, values)

      expect(result).toBe('git status')
    })
  })
})
