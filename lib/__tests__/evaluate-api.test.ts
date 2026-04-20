import { describe, it, expect } from 'vitest'
import { evaluateSchema } from '../validations'

describe('evaluateSchema', () => {
  it('rejects empty input (both url and jdText empty)', () => {
    const result = evaluateSchema.safeParse({ url: '', jdText: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Provide a URL or paste JD text')
    }
  })

  it('accepts when only jdText is provided', () => {
    const result = evaluateSchema.safeParse({ jdText: 'Senior Engineer at Acme Corp...' })
    expect(result.success).toBe(true)
  })

  it('accepts when only url is provided', () => {
    const result = evaluateSchema.safeParse({ url: 'https://example.com/jobs/123' })
    expect(result.success).toBe(true)
  })
})

describe('score parsing regex', () => {
  it('extracts score 4.2 from evaluation text', () => {
    const text = 'some text\nSCORE: 4.2\nmore text'
    const match = text.match(/SCORE:\s*(\d+\.?\d*)/)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('4.2')
    expect(parseFloat(match![1])).toBe(4.2)
  })

  it('returns null when no SCORE line present', () => {
    const text = 'some text without a score line'
    const match = text.match(/SCORE:\s*(\d+\.?\d*)/)
    expect(match).toBeNull()
  })
})
