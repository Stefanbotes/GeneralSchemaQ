// app/api/admin/db-hard-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOOTSTRAP_SQL = `
-- ============================
-- Fresh schema matching Prisma
-- ============================

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssessmentStatus') THEN
    CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'COACH', 'ADMIN');
  END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "users" (
  "id"              TEXT PRIMARY KEY,
  "email"           TEXT NOT NULL UNIQUE,
  "firstName"       TEXT NOT NULL,
  "lastName"        TEXT NOT NULL,
  "password"        TEXT NOT NULL,
  "role"            "UserRole" NOT NULL DEFAULT 'CLIENT',
  "emailVerified"   TIMESTAMP(3),
  "tokenVersion"    INTEGER NOT NULL DEFAULT 0,
  "loginAttempts"   INTEGER NOT NULL DEFAULT 0,
  "lockoutUntil"    TIMESTAMP(3),
  "lastLogin"       TIMESTAMP(3),
  "passwordChangedAt" TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "id"            TEXT PRIMARY KEY,
  "sessionToken"  TEXT NOT NULL UNIQUE,
  "userId"        TEXT NOT NULL,
  "expires"       TIMESTAMP(3) NOT NULL,
  "tokenVersion"  INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "accounts" (
  "id"                TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider","providerAccountId");

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "id"         TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL UNIQUE,
  "userId"     TEXT,
  "expires"    TIMESTAMP(3) NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Prisma expects unique(identifier, token)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='verification_tokens_identifier_token_key'
  ) THEN
    CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier","token");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id"        TEXT PRIMARY KEY,
  "token"     TEXT NOT NULL UNIQUE,
  "email"     TEXT,
  "userId"    TEXT,
  "expires"   TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "assessment_questions" (
  "id"        TEXT PRIMARY KEY,
  "order"     INTEGER NOT NULL UNIQUE,
  "domain"    TEXT,
  "schema"    TEXT,
  "persona"   TEXT,
  "healthyPersona" TEXT,
  "statement" TEXT NOT NULL,
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessments" (
  "id"                TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL,
  "status"            "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "agreedToTerms"     BOOLEAN NOT NULL DEFAULT FALSE,
  "agreedAt"          TIMESTAMP(3),
  "responses"         JSONB,
  "leadershipPersona" TEXT,
  "results"           JSONB,
  "startedAt"         TIMESTAMP(3),
  "completedAt"       TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "leadership_personas" (
  "id"              TEXT PRIMARY KEY,
  "name"            TEXT NOT NULL UNIQUE,
  "description"     TEXT NOT NULL,
  "characteristics" JSONB NOT NULL,
  "strengths"       JSONB NOT NULL,
  "growthAreas"     JSONB NOT NULL,
  "isActive"        BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "lasbi_items" (
  "item_id"         TEXT PRIMARY KEY,
  "canonical_id"    TEXT NOT NULL UNIQUE,
  "variable_id"     TEXT NOT NULL,
  "question_number" INTEGER NOT NULL,
  "schema_label"    TEXT NOT NULL,
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "lasbi_items_canonical_id_idx" ON "lasbi_items"("canonical_id");
CREATE INDEX IF NOT EXISTS "lasbi_items_variable_id_idx" ON "lasbi_items"("variable_id");

CREATE TABLE IF NOT EXISTS "lasbi_responses" (
  "response_id"     TEXT PRIMARY KEY,
  "assessment_id"   TEXT NOT NULL,
  "item_id"         TEXT NOT NULL,
  "canonical_id"    TEXT NOT NULL,
  "variable_id"     TEXT NOT NULL,
  "value"           INTEGER NOT NULL,
  "mapping_version" TEXT NOT NULL DEFAULT '1.0.1',
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lasbi_responses_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lasbi_responses_item_id_fkey"       FOREIGN KEY ("item_id")       REFERENCES "lasbi_items"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "lasbi_responses_assessment_id_item_id_key" ON "lasbi_responses"("assessment_id","item_id");
CREATE INDEX IF NOT EXISTS "lasbi_responses_assessment_id_idx" ON "lasbi_responses"("assessment_id");
CREATE INDEX IF NOT EXISTS "lasbi_responses_variable_id_idx" ON "lasbi_responses"("variable_id");
CREATE INDEX IF NOT EXISTS "lasbi_responses_canonical_id_idx" ON "lasbi_responses"("canonical_id");

CREATE TABLE IF NOT EXISTS "rate_limit_records" (
  "id"           TEXT PRIMARY KEY,
  "userId"       TEXT,
  "ipAddress"    TEXT,
  "action"       TEXT NOT NULL,
  "attempts"     INTEGER NOT NULL DEFAULT 1,
  "windowStart"  TIMESTAMP(3) NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rate_limit_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "rate_limit_records_ipAddress_action_windowStart_key"
  ON "rate_limit_records"("ipAddress","action","windowStart");
CREATE UNIQUE INDEX IF NOT EXISTS "rate_limit_records_userId_action_windowStart_key"
  ON "rate_limit_records"("userId","action","windowStart");
`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const owner = (process.env.OWNER_EMAIL || "").toLowerCase().trim();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  if (!owner || session.user.email.toLowerCase() !== owner) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1) nuke schema
    await db.$executeRawUnsafe(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);

    // 2) bootstrap fresh schema
    await db.$executeRawUnsafe(BOOTSTRAP_SQL);

    return NextResponse.json({ ok: true, message: "Database reset and bootstrapped." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "reset failed" }, { status: 500 });
  }
}

// (optional) GET to verify the route exists
export async function GET() {
  return new Response("Use POST", { status: 405 });
}
