import { NextAuthOptions, DefaultSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
    onboarded?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.userId = user.id
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        })
        token.onboarded = !!profile
      }
      if (trigger === 'update') {
        const profile = await prisma.profile.findUnique({
          where: { userId: token.userId as string },
          select: { id: true },
        })
        token.onboarded = !!profile
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user && token) {
        session.user.id = token.userId as string
        session.onboarded = token.onboarded as boolean | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
}
