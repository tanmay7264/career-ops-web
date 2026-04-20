import { describe, it, expect } from 'vitest'
import {
  filterByStatus,
  filterByScore,
  sortApplications,
  type ApplicationWithReport,
} from '../applications-utils'

function makeApp(overrides: Partial<ApplicationWithReport>): ApplicationWithReport {
  return {
    id: 'id-' + Math.random(),
    userId: 'user-1',
    num: 1,
    company: 'Acme',
    role: 'Engineer',
    score: null,
    status: 'Evaluated',
    url: null,
    notes: null,
    report: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

const apps: ApplicationWithReport[] = [
  makeApp({ id: '1', num: 3, status: 'Interview', score: 4.8 }),
  makeApp({ id: '2', num: 1, status: 'Evaluated', score: 1.5 }),
  makeApp({ id: '3', num: 2, status: 'Applied', score: 3.2 }),
  makeApp({ id: '4', num: 4, status: 'Offer', score: null }),
]

describe('filterByStatus', () => {
  it('returns only apps matching the selected status', () => {
    const result = filterByStatus(apps, ['Interview'])
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('Interview')
  })

  it('returns all apps when no statuses are selected', () => {
    const result = filterByStatus(apps, [])
    expect(result).toHaveLength(apps.length)
  })

  it('returns apps matching any of multiple statuses', () => {
    const result = filterByStatus(apps, ['Interview', 'Offer'])
    expect(result).toHaveLength(2)
  })
})

describe('filterByScore', () => {
  it('filters by minimum score', () => {
    const scoredApps = apps.filter((a) => a.score != null)
    const result = filterByScore(scoredApps, 3, null)
    expect(result.map((a) => a.score)).toEqual(expect.arrayContaining([3.2, 4.8]))
    expect(result.some((a) => a.score === 1.5)).toBe(false)
  })

  it('filters by max score', () => {
    const scoredApps = apps.filter((a) => a.score != null)
    const result = filterByScore(scoredApps, null, 4)
    expect(result.every((a) => (a.score ?? 0) <= 4)).toBe(true)
  })

  it('returns apps with scores [3.2, 4.8] when filtering min=3 from [1.5, 3.2, 4.8]', () => {
    const testApps = [
      makeApp({ score: 1.5 }),
      makeApp({ score: 3.2 }),
      makeApp({ score: 4.8 }),
    ]
    const result = filterByScore(testApps, 3, null)
    expect(result).toHaveLength(2)
    const scores = result.map((a) => a.score)
    expect(scores).toContain(3.2)
    expect(scores).toContain(4.8)
    expect(scores).not.toContain(1.5)
  })
})

describe('sortApplications', () => {
  it('sorts by num ascending', () => {
    const result = sortApplications(apps, 'num', 'asc')
    const nums = result.map((a) => a.num)
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })

  it('sorts by num descending', () => {
    const result = sortApplications(apps, 'num', 'desc')
    const nums = result.map((a) => a.num)
    expect(nums).toEqual([...nums].sort((a, b) => b - a))
  })

  it('does not mutate the original array', () => {
    const original = apps.map((a) => a.num)
    sortApplications(apps, 'num', 'asc')
    expect(apps.map((a) => a.num)).toEqual(original)
  })
})
