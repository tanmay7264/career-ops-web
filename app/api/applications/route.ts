import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { num: 'desc' },
    include: { report: { select: { id: true } } },
  })

  return NextResponse.json(applications)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { company, role, score, status, notes, url } = body

  if (!company || !role) {
    return NextResponse.json({ error: 'company and role are required' }, { status: 400 })
  }

  const userId = session.user.id

  const application = await prisma.$transaction(async (tx) => {
    const lastApp = await tx.application.findFirst({
      where: { userId },
      orderBy: { num: 'desc' },
      select: { num: true },
    })
    const nextNum = (lastApp?.num ?? 0) + 1
    return tx.application.create({
      data: {
        userId,
        num: nextNum,
        company,
        role,
        score: score ?? null,
        status: status ?? 'Evaluated',
        notes: notes ?? null,
        url: url ?? null,
      },
      include: { report: { select: { id: true } } },
    })
  })

  return NextResponse.json(application, { status: 201 })
}
