import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { EvaluatePageClient } from '@/components/evaluate/EvaluatePageClient'

export default async function EvaluatePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  return (
    <AppShell>
      <PageHeader
        title="Evaluate Job"
        subtitle="Paste a JD URL or text to get an AI evaluation"
      />
      <EvaluatePageClient />
    </AppShell>
  )
}
