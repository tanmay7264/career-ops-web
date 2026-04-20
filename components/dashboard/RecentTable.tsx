'use client'

import Link from 'next/link'
import type { Application } from '@/lib/generated/prisma'
import { scoreColorClass } from '@/lib/dashboard-utils'

type ApplicationWithReport = Application & {
  report?: { id: string } | null
}

interface RecentTableProps {
  applications: ApplicationWithReport[]
}

export function RecentTable({ applications }: RecentTableProps) {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        No applications yet. Evaluate a job to get started.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['#', 'Company', 'Role', 'Score', 'Status', 'Report'].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">{app.num}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{app.company}</td>
              <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{app.role}</td>
              <td className="px-4 py-3">
                {app.score != null ? (
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColorClass(app.score)}`}
                  >
                    {app.score.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{app.status}</td>
              <td className="px-4 py-3">
                {app.report?.id ? (
                  <Link
                    href={`/reports/${app.report.id}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    View
                  </Link>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
