// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
    // firstName?: string | null;
    // lastName?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      role?: "CLIENT" | "COACH" | "ADMIN";
      emailVerified?: Date | null;
      tokenVersion?: number;
      // firstName?: string | null;
      // lastName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    // JWTs serialize dates as strings:
    emailVerified?: string | null;
    tokenVersion?: number;
    // firstName?: string | null;
    // lastName?: string | null;
  }
}

// Make this a module (avoids global augmentation pitfalls if isolatedModules is on)
export {};
