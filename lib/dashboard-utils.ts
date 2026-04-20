/**
 * Returns a Tailwind CSS class string for colorizing a score badge.
 * green ≥4, yellow ≥3, red <3, gray if null/undefined
 */
export function scoreColorClass(score: number | null | undefined): string {
  if (score == null) return 'bg-gray-100 text-gray-500'
  if (score >= 4) return 'bg-green-100 text-green-700'
  if (score >= 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

/**
 * Counts applications with a specific status.
 */
export function countByStatus(
  applications: Array<{ status: string }>,
  status: string,
): number {
  return applications.filter((a) => a.status === status).length
}
