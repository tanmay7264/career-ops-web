import type { Application } from '@/lib/generated/prisma'

export type ApplicationWithReport = Application & { report: { id: string } | null }

export type SortKey = 'num' | 'company' | 'role' | 'score' | 'status' | 'createdAt'
export type SortDir = 'asc' | 'desc'

export const CANONICAL_STATUSES = [
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
] as const

export type CanonicalStatus = (typeof CANONICAL_STATUSES)[number]

export function filterByStatus(
  apps: ApplicationWithReport[],
  statuses: string[],
): ApplicationWithReport[] {
  if (statuses.length === 0) return apps
  return apps.filter((a) => statuses.includes(a.status))
}

export function filterByScore(
  apps: ApplicationWithReport[],
  min: number | null,
  max: number | null,
): ApplicationWithReport[] {
  return apps.filter((a) => {
    const s = a.score
    if (s == null) return min == null && max == null
    if (min != null && s < min) return false
    if (max != null && s > max) return false
    return true
  })
}

export function sortApplications(
  apps: ApplicationWithReport[],
  key: SortKey,
  dir: SortDir,
): ApplicationWithReport[] {
  const sorted = [...apps].sort((a, b) => {
    let av: string | number | null | Date
    let bv: string | number | null | Date

    if (key === 'num') {
      av = a.num
      bv = b.num
    } else if (key === 'score') {
      av = a.score ?? -Infinity
      bv = b.score ?? -Infinity
    } else if (key === 'createdAt') {
      av = a.createdAt.getTime()
      bv = b.createdAt.getTime()
    } else {
      av = (a[key] as string) ?? ''
      bv = (b[key] as string) ?? ''
    }

    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}
