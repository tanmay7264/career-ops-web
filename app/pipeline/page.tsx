import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PipelineInbox } from '@/components/pipeline/PipelineInbox'

export default async function PipelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  return (
    <AppShell>
      <PageHeader
        title="Pipeline"
        subtitle="Add URLs to evaluate in bulk"
        action={{ label: 'Evaluate Single', href: '/evaluate' }}
      />
      <PipelineInbox />
    </AppShell>
  )
}
