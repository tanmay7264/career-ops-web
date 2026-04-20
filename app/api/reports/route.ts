import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reports = await prisma.report.findMany({
      where: { userId: session.user.id },
      include: { application: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reports)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
