
// NextAuth configuration with custom authentication
import { NextAuthOptions, Session, User } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { PasswordUtils, LockoutUtils } from './auth-utils';
import { UserRole } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    emailVerified: boolean;
    tokenVersion: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      emailVerified: boolean;
    };
    tokenVersion: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    emailVerified: boolean;
    tokenVersion: number;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if account is locked
          const isLocked = await LockoutUtils.isAccountLocked(user.id);
          if (isLocked) {
            const lockoutInfo = await db.user.findUnique({
              where: { id: user.id },
              select: { lockoutUntil: true }
            });
            
            const lockoutMinutes = lockoutInfo?.lockoutUntil 
              ? Math.ceil((lockoutInfo.lockoutUntil.getTime() - Date.now()) / (60 * 1000))
              : 0;
            
            throw new Error(`Account locked. Try again in ${lockoutMinutes} minutes.`);
          }

          // Verify password
          const isValidPassword = await PasswordUtils.verify(user.password, credentials.password);
          
          if (!isValidPassword) {
            // Increment login attempts
            await LockoutUtils.incrementLoginAttempts(user.id);
            throw new Error('Invalid email or password');
          }

          // Check email verification
          if (!user.emailVerified) {
            throw new Error('Please verify your email before logging in');
          }

          // Reset login attempts on successful login
          await LockoutUtils.resetLoginAttempts(user.id);

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            tokenVersion: user.tokenVersion,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.emailVerified = Boolean(user.emailVerified);
        token.tokenVersion = user.tokenVersion;
      }

      // Check if token is still valid (session versioning)
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id },
          select: { tokenVersion: true, emailVerified: true }
        });

        // Invalidate token if version doesn't match
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          return {} as any;
        }

        // Update email verification status
        token.emailVerified = dbUser.emailVerified || false;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        if (session.firstName) token.firstName = session.firstName;
        if (session.lastName) token.lastName = session.lastName;
        if (session.role) token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
        session.tokenVersion = token.tokenVersion;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { userId: user.id, email: user.email });
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token.id });
    },
  },
  debug: false, // Disable debug to prevent warnings
};

// Helper function to get session with proper typing
export async function getServerSession(): Promise<Session | null> {
  const { getServerSession: getNextAuthSession } = await import('next-auth/next');
  return getNextAuthSession(authOptions);
}
