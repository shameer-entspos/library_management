import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        access: { label: 'Token', type: 'text' },
        refresh: { label: 'Token', type: 'text', optional: true },
        role: { label: 'Role', type: 'text', optional: true },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const access = credentials?.access as string | undefined
        const refresh = credentials?.refresh as string | undefined
        const role = credentials?.role as string | undefined

        if (!email || !access) {
          return null
        }

        return {
          email,
          access,
          refresh,
          role,
        }
      },
    }),
  ],
  debug: true,
  callbacks: {
    jwt: async ({ token, user }) => {
      // Default behavior
      return { ...token, ...user }
    },

    session: async ({ session, token, user }) => {
      session.user = { ...token, ...user }
      return session
    },

    authorized: async ({ auth }) => {
      return !!auth
    },
  },
  pages: {
    signIn: '/',
    signOut: '/login',
  },
})
