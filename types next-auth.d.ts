import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
  }

  interface Session {
    user: {
      id?: string;
      role?: "CLIENT" | "COACH" | "ADMIN";
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
  }
}
