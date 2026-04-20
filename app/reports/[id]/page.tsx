import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ReportViewer } from '@/components/reports/ReportViewer'
import type { Report, Application } from '@/lib/generated/prisma'

type ReportWithApplication = Report & { application?: Application | null }

export default async function ReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/')
  }

  let report: ReportWithApplication | null = null
  const cookieHeader = cookies().toString()
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/reports/${params.id}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (res.ok) {
      report = await res.json()
    }
  } catch {
    // fall through
  }

  if (!report) {
    redirect('/applications')
  }

  const application = report.application

  return (
    <AppShell>
      <PageHeader
        title={`Report #${application?.num ?? ''}`}
        subtitle={application ? `${application.company} — ${application.role}` : 'Report'}
      />
      <ReportViewer report={report} />
    </AppShell>
  )
}
