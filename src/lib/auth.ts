import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenant: { label: 'Tenant', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              client: {
                select: { id: true, companyName: true, status: true, customDomain: true },
              },
            },
          })
          if (!user) return null

          if (credentials.tenant && !user.isSuperAdmin) {
            const tenantMatches =
              user.clientId === credentials.tenant ||
              user.client?.customDomain === credentials.tenant ||
              user.client?.companyName?.toLowerCase().replace(/\s+/g, '') === credentials.tenant
            if (!tenantMatches) return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) return null

          if (user.status && user.status !== 'ACTIVE') return null
          if (user.client && user.client.status !== 'ACTIVE') return null

          await prisma.user.update({ where: { id: user.id }, data: { updatedAt: new Date() } })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: user.clientId,
            companyName: user.client?.companyName,
            isSuperAdmin: user.isSuperAdmin,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.clientId = (user as any).clientId
        token.companyName = (user as any).companyName
        token.isSuperAdmin = (user as any).isSuperAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).clientId = token.clientId as string
        ;(session.user as any).companyName = token.companyName as string
        ;(session.user as any).isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
