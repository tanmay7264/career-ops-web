import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')
  if (!session.onboarded) redirect('/onboarding')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) redirect('/onboarding')

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and configuration"
      />
      <SettingsTabs profile={profile} />
    </AppShell>
  )
}
