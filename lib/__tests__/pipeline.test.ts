import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('URL validation', () => {
  it('rejects invalid URLs', () => {
    expect(z.string().url().safeParse('not-a-url').success).toBe(false)
  })

  it('accepts valid URLs', () => {
    expect(z.string().url().safeParse('https://example.com').success).toBe(true)
  })
})

describe('REPORT_ID extraction', () => {
  it('extracts report ID from sentinel string', () => {
    const text = 'some text\n\nREPORT_ID:abc123'
    const lines = text.split('\n')
    const lastLine = lines[lines.length - 1]
    const match = lastLine.match(/([\w-]+)$/)
    expect(match?.[1]).toBe('abc123')
  })
})
