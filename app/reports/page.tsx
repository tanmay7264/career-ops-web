import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText, ExternalLink } from 'lucide-react'
import type { Report, Application } from '@/lib/generated/prisma'

type ReportWithApplication = Report & { application?: Application | null }

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">—</span>
  const color = score >= 4 ? 'bg-green-100 text-green-700' : score >= 2.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{score.toFixed(1)}</span>
}

function LegitBadge({ legitimacy }: { legitimacy: string | null }) {
  if (!legitimacy) return null
  const styles: Record<string, string> = {
    REAL: 'bg-green-50 text-green-600',
    SUSPICIOUS: 'bg-yellow-50 text-yellow-600',
    FAKE: 'bg-red-50 text-red-600',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[legitimacy] ?? 'bg-gray-100 text-gray-600'}`}>{legitimacy}</span>
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  let reports: ReportWithApplication[] = []
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/reports`, {
      headers: { cookie: cookies().toString() },
      cache: 'no-store',
    })
    if (res.ok) reports = await res.json()
  } catch { /* fall through */ }

  return (
    <AppShell>
      <PageHeader title="Reports" subtitle={`${reports.length} evaluation${reports.length !== 1 ? 's' : ''}`} />

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText size={40} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No reports yet</p>
          <p className="text-sm text-gray-400 mt-1">Evaluate a job from the <Link href="/evaluate" className="text-indigo-600 hover:underline">Evaluate tab</Link> to generate your first report.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Legitimacy</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{report.application?.num ?? '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{report.application?.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{report.application?.role ?? '—'}</td>
                  <td className="px-5 py-3.5"><ScoreBadge score={report.application?.score ?? null} /></td>
                  <td className="px-5 py-3.5"><LegitBadge legitimacy={report.legitimacy} /></td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/reports/${report.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      View <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
