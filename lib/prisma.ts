// IMPORTANT: Application.num must be assigned as MAX(num)+1 WHERE userId=?
// inside a transaction before insert to ensure gap-free sequential numbering per user.
import { PrismaClient } from './generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, log: ['error'] })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
