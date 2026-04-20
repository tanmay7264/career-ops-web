import { describe, it, expect } from 'vitest'
import { buildEvaluationPrompt } from '../prompt'
import type { Profile } from '../generated/prisma'

const baseProfile: Profile = {
  id: 'profile-1',
  userId: 'user-1',
  fullName: 'Jane Doe',
  location: 'San Francisco',
  targetRoles: 'Senior Engineer',
  seniority: 'Senior',
  salaryMin: 150000,
  salaryMax: 200000,
  currency: 'USD',
  superpower: 'I ship AI products fast',
  cvMarkdown: 'My CV content here',
  portalsYaml: '',
  includeKw: '',
  excludeKw: '',
  onboardedAt: new Date(),
  updatedAt: new Date(),
}

describe('buildEvaluationPrompt', () => {
  it('includes CV content', () => {
    const result = buildEvaluationPrompt(baseProfile, 'Software Engineer at Acme Corp')
    expect(result).toContain('My CV content here')
  })

  it('includes target roles', () => {
    const result = buildEvaluationPrompt(baseProfile, 'Software Engineer at Acme Corp')
    expect(result).toContain('Senior Engineer')
  })

  it('includes all blocks A through G', () => {
    const result = buildEvaluationPrompt(baseProfile, 'Software Engineer at Acme Corp')
    expect(result).toContain('Block A')
    expect(result).toContain('Block B')
    expect(result).toContain('Block C')
    expect(result).toContain('Block D')
    expect(result).toContain('Block E')
    expect(result).toContain('Block F')
    expect(result).toContain('Block G')
  })

  it('includes URL when provided', () => {
    const result = buildEvaluationPrompt(baseProfile, 'Software Engineer at Acme Corp', 'https://example.com/job')
    expect(result).toContain('https://example.com/job')
  })

  it('does not include URL when not provided', () => {
    const result = buildEvaluationPrompt(baseProfile, 'Software Engineer at Acme Corp')
    expect(result).not.toContain('https://example.com/job')
  })
})
