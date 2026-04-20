'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { scoreColorClass } from '@/lib/dashboard-utils'
import type { Report, Application } from '@/lib/generated/prisma'

interface ReportViewerProps {
  report: Report & { application?: Application | null }
}

function legitimacyBadge(legitimacy: string | null) {
  if (!legitimacy) return null
  const upper = legitimacy.toUpperCase()
  const styles: Record<string, string> = {
    REAL: 'bg-green-100 text-green-700',
    SUSPICIOUS: 'bg-yellow-100 text-yellow-700',
    FAKE: 'bg-red-100 text-red-700',
  }
  const cls = styles[upper] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {upper}
    </span>
  )
}

export function ReportViewer({ report }: ReportViewerProps) {
  const app = report.application

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/applications"
        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
      >
        ← Back to Applications
      </Link>

      {/* Score + legitimacy header */}
      <div className="flex items-center gap-4 flex-wrap">
        {app?.score != null ? (
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-lg font-bold ${scoreColorClass(app.score)}`}
          >
            {app.score.toFixed(1)} / 5
          </span>
        ) : (
          <span className="inline-block px-4 py-1.5 rounded-full text-lg font-bold bg-gray-100 text-gray-400">
            No score
          </span>
        )}
        {legitimacyBadge(report.legitimacy)}
      </div>

      {/* Report content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
      </div>
    </div>
  )
}
