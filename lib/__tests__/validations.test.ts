import { describe, it, expect } from 'vitest'
import { profileStep1Schema } from '../validations'

describe('profileStep1Schema', () => {
  it('rejects empty name', () => {
    const result = profileStep1Schema.safeParse({ fullName: '' })
    expect(result.success).toBe(false)
  })
  it('rejects missing salary', () => {
    const result = profileStep1Schema.safeParse({
      fullName: 'Jane', location: 'SF', targetRoles: 'AI Lead',
      seniority: 'Director', salaryMin: 0, salaryMax: 0, superpower: 'test'
    })
    expect(result.success).toBe(false)
  })
  it('accepts valid profile', () => {
    const result = profileStep1Schema.safeParse({
      fullName: 'Jane Doe', location: 'San Francisco',
      targetRoles: 'Head of AI', seniority: 'Director',
      salaryMin: 180000, salaryMax: 240000,
      superpower: 'I ship AI products',
    })
    expect(result.success).toBe(true)
  })
})
