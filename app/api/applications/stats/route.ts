import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const [total, applied, interviews, offers] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.count({ where: { userId, status: { in: ['Applied', 'Responded', 'Interview', 'Offer'] } } }),
    prisma.application.count({ where: { userId, status: 'Interview' } }),
    prisma.application.count({ where: { userId, status: 'Offer' } }),
  ])

  const avgScore = await prisma.application.aggregate({
    where: { userId, score: { not: null } },
    _avg: { score: true },
  })

  return NextResponse.json({
    total,
    applied,
    interviews,
    offers,
    avgScore: avgScore._avg.score ? Number(avgScore._avg.score.toFixed(1)) : null,
  })
}
