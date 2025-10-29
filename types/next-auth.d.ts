// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extend NextAuth types to include custom fields (role, tokenVersion, etc.)
declare module "next-auth" {
  interface User {
    id: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
    // Optional extras if you want later:
    // firstName?: string | null;
    // lastName?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      role?: "CLIENT" | "COACH" | "ADMIN";
      emailVerified?: Date | null;
      tokenVersion?: number;
    } & DefaultSession["user"];
  }
}

// Extend JWT payload so callbacks can carry custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: string | null; // JWT serializes dates to strings
    tokenVersion?: number;
  }
}

// Ensure this file is treated as a module
export {};
