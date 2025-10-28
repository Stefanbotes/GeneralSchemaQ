// lib/auth-config.ts
import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs" // or whatever you use

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const user = await prisma.user.findUnique({ where: { email: creds.email.toLowerCase() } })
        if (!user) return null
        const ok = await compare(creds.password, user.password)
        if (!ok) return null
        // Return minimal safe fields
        return { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion }
      },
    }),
  ],

  callbacks: {
    // Put role & tokenVersion on the JWT
    async jwt({ token, user, trigger }) {
      // On initial sign-in, copy from returned user
      if (user?.email) {
        token.email = user.email
        // @ts-ignore - add custom values
        token.role = (user as any).role
        // @ts-ignore
        token.tokenVersion = (user as any).tokenVersion ?? 0
      }

      // Always refresh from DB so role changes are reflected after promote
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { role: true, tokenVersion: true },
        })
        if (dbUser) {
          // @ts-ignore
          token.role = dbUser.role
          // @ts-ignore
          token.tokenVersion = dbUser.tokenVersion ?? 0
        }
      }
      return token
    },

    // Expose role on session.user.role
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role || "CLIENT"
        // Optional: expose tokenVersion if you use it elsewhere
        // @ts-ignore
        session.user.tokenVersion = token.tokenVersion ?? 0
      }
      return session
    },
  },
}
