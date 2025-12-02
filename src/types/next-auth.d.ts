import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      clientId?: string | null
      companyName?: string
      isSuperAdmin: boolean
    }
  }

  interface User {
    role: string
    clientId?: string | null
    companyName?: string
    isSuperAdmin: boolean
  }

  interface JWT {
    role: string
    clientId?: string | null
    companyName?: string
    isSuperAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    isSuperAdmin?: boolean
  }
}