import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth' // use '../../../../lib/auth' if you don’t have '@' alias

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
