import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { findUserWithRetry, createUserSafely } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  providers: [
    // Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    
    // GitHub OAuth Provider
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
    
    // Credentials Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isDemo: { label: "Demo Mode", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password')
        }

        // Demo mode login
        if (credentials.isDemo === 'true') {
          const timestamp = Date.now()
          const demoEmail = `demo_${timestamp}@example.com`
          const demoUsername = `DemoUser${timestamp}`
          const demoUser = await createUserSafely({
            email: demoEmail,
            username: demoUsername,
            passwordHash: await bcrypt.hash('demo123', 10)
          })
          
          if (demoUser) {
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.username || 'Demo User'
            }
          }
          throw new Error('Failed to create demo account')
        }

        // Regular login
        const user = await findUserWithRetry(credentials.email, 'email')
        
        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
        
        if (!isValidPassword) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.email.split('@')[0]
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', user.email)
    },
    async signOut({ session, token }) {
      console.log('User signed out')
    }
  },
  debug: process.env.NODE_ENV === 'development',
}