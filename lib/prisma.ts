// IMPORTANT: Application.num must be assigned as MAX(num)+1 WHERE userId=?
// inside a transaction before insert to ensure gap-free sequential numbering per user.
import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
