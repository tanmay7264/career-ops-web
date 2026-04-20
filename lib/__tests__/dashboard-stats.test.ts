import { describe, it, expect } from 'vitest'
import { scoreColorClass, countByStatus } from '../dashboard-utils'

describe('scoreColorClass', () => {
  it('returns green class for score >= 4', () => {
    expect(scoreColorClass(4.2)).toContain('green')
    expect(scoreColorClass(4.0)).toContain('green')
    expect(scoreColorClass(5.0)).toContain('green')
  })

  it('returns yellow class for score >= 3 and < 4', () => {
    expect(scoreColorClass(3.5)).toContain('yellow')
    expect(scoreColorClass(3.0)).toContain('yellow')
  })

  it('returns red class for score < 3', () => {
    expect(scoreColorClass(2.5)).toContain('red')
    expect(scoreColorClass(1.0)).toContain('red')
    expect(scoreColorClass(0)).toContain('red')
  })

  it('returns gray class for null score', () => {
    expect(scoreColorClass(null)).toContain('gray')
  })

  it('returns gray class for undefined score', () => {
    expect(scoreColorClass(undefined)).toContain('gray')
  })
})

describe('countByStatus', () => {
  const applications = [
    { status: 'Evaluated' },
    { status: 'Applied' },
    { status: 'Interview' },
    { status: 'Interview' },
    { status: 'Offer' },
    { status: 'Rejected' },
    { status: 'Evaluated' },
  ]

  it('correctly counts Interview status', () => {
    expect(countByStatus(applications, 'Interview')).toBe(2)
  })

  it('correctly counts Evaluated status', () => {
    expect(countByStatus(applications, 'Evaluated')).toBe(2)
  })

  it('returns 0 for a status with no matches', () => {
    expect(countByStatus(applications, 'SKIP')).toBe(0)
  })

  it('correctly counts Offer status', () => {
    expect(countByStatus(applications, 'Offer')).toBe(1)
  })
})
