import { describe, it, expect } from 'vitest'

// Extract highlight functions from CommandLayout.vue for testing
// These mirror the implementation in the Vue component

const escapeHtml = (str) => {
  if (!str) return str
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const highlightText = (text, query) => {
  if (!text) return text
  // If no search term, return escaped text
  if (!query) return escapeHtml(text)
  const queries = query.toLowerCase().split(/\s+/).filter(q => q)
  if (queries.length === 0) return escapeHtml(text)
  // Escape HTML special chars in original text
  const escapedText = escapeHtml(text)
  const regex = new RegExp(`(${queries.map(q => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const result = escapedText.replace(regex, '<mark class="highlight">$1</mark>')
  return result
}

describe('Highlight Utils', () => {
  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('should escape less than', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b')
    })

    it('should escape greater than', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b')
    })

    it('should escape quotes', () => {
      expect(escapeHtml('a "b"')).toBe('a &quot;b&quot;')
    })

    it('should escape single quotes', () => {
      expect(escapeHtml("a 'b'")).toBe('a &#39;b&#39;')
    })

    it('should handle null/undefined', () => {
      expect(escapeHtml(null)).toBeNull()
      expect(escapeHtml(undefined)).toBeUndefined()
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })
  })

  describe('highlightText', () => {
    it('should return escaped text when no query', () => {
      const result = highlightText('git status', '')
      expect(result).toBe('git status')
    })

    it('should return escaped text when query is null', () => {
      const result = highlightText('git <status>', null)
      expect(result).toBe('git &lt;status&gt;')
    })

    it('should highlight single match', () => {
      const result = highlightText('git status', 'git')
      expect(result).toContain('<mark class="highlight">git</mark>')
      expect(result).toBe('<mark class="highlight">git</mark> status')
    })

    it('should highlight multiple matches', () => {
      const result = highlightText('git git status', 'git')
      expect(result).toContain('<mark class="highlight">git</mark>')
    })

    it('should be case insensitive', () => {
      const result = highlightText('Git Status', 'git')
      expect(result).toContain('<mark class="highlight">Git</mark>')
    })

    it('should handle multiple search terms', () => {
      const result = highlightText('git commit status', 'git status')
      expect(result).toContain('<mark class="highlight">git</mark>')
      expect(result).toContain('<mark class="highlight">status</mark>')
    })

    it('should handle special regex characters in query', () => {
      const result = highlightText('npm install (package)', 'install (')
      // Query with special chars should still highlight matched text
      expect(result).toContain('<mark class="highlight">install</mark>')
    })

    it('should return original when text is null', () => {
      expect(highlightText(null, 'query')).toBeNull()
    })

    it('should return original when text is undefined', () => {
      expect(highlightText(undefined, 'query')).toBeUndefined()
    })

    it('should handle empty query string', () => {
      const result = highlightText('git status', '')
      expect(result).toBe('git status')
    })

    it('should handle whitespace-only query', () => {
      const result = highlightText('git status', '   ')
      expect(result).toBe('git status')
    })

    it('should highlight multiple space-separated terms', () => {
      const result = highlightText('git commit -m message', 'git m')
      expect(result).toContain('<mark class="highlight">git</mark>')
      expect(result).toContain('<mark class="highlight">m</mark>')
    })
  })
})
