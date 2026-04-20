import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ApplicationsTable } from '@/components/applications/ApplicationsTable'
import type { ApplicationWithReport } from '@/lib/applications-utils'

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/')
  }

  let applications: ApplicationWithReport[] = []
  const cookieHeader = cookies().toString()
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/applications`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (res.ok) {
      applications = await res.json()
    }
  } catch {
    // fall through with empty array
  }

  return (
    <AppShell>
      <PageHeader
        title="Applications"
        subtitle="Track your job applications"
        action={{ label: 'Evaluate New', href: '/evaluate' }}
      />
      <ApplicationsTable initialApplications={applications} />
    </AppShell>
  )
}
