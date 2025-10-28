// app/api/db-check/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

export const runtime = "nodejs"

export async function GET() {
  const [row] = await db.$queryRaw<
    Array<{ db: string; user: string; host: string }>
  >`SELECT current_database() as db, current_user as user, inet_server_addr()::text as host;`
  return NextResponse.json(row)
}
