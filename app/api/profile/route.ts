import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma'
import { z } from 'zod'
import { profileUpdateSchema } from '@/lib/validations'

const createProfileSchema = z.object({
  fullName: z.string().min(1),
  location: z.string().min(1),
  targetRoles: z.string().min(1),
  seniority: z.string().min(1),
  salaryMin: z.number(),
  salaryMax: z.number(),
  superpower: z.string().min(1),
  cvMarkdown: z.string().min(1),
  portalsYaml: z.string().min(1),
  includeKw: z.string().min(1),
  excludeKw: z.string().optional().default(''),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createProfileSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...parsed.data },
      update: parsed.data,
    })

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: parsed.data,
    })
    return NextResponse.json(profile)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
