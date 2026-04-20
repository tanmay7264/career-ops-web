'use client'

import { useEffect, useState } from 'react'
import { StatCard } from './StatCard'
import { RecentTable } from './RecentTable'
import type { Application } from '@/lib/generated/prisma'
import { Skeleton } from '@/components/ui/skeleton'

type ApplicationWithReport = Application & {
  report?: { id: string } | null
}

interface Stats {
  total: number
  applied: number
  interviews: number
  offers: number
  avgScore: number | null
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [applications, setApplications] = useState<ApplicationWithReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, appsRes] = await Promise.all([
          fetch('/api/applications/stats'),
          fetch('/api/applications'),
        ])

        if (!statsRes.ok || !appsRes.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const [statsData, appsData] = await Promise.all([statsRes.json(), appsRes.json()])
        setStats(statsData)
        setApplications(appsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="p-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-7">
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      </div>
    )
  }

  const recent = applications.slice(0, 5)

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Evaluated"
          value={stats?.total ?? 0}
          subtitle="All time"
        />
        <StatCard
          title="Applied / Active"
          value={stats?.applied ?? 0}
          subtitle="Applied, Responded, Interview, Offer"
        />
        <StatCard
          title="Interviews"
          value={stats?.interviews ?? 0}
          subtitle="Currently in process"
        />
        <StatCard
          title="Offers"
          value={stats?.offers ?? 0}
          subtitle={stats?.avgScore != null ? `Avg score: ${stats.avgScore}` : 'No scores yet'}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Recent Applications</h2>
        <RecentTable applications={recent} />
      </div>
    </div>
  )
}
