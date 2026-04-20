import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/')
  }

  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Your job search at a glance" />
      <DashboardClient />
    </AppShell>
  )
}
