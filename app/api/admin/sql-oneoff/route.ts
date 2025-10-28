// app/api/admin/sql-oneoff/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const hdr = req.headers.get("x-reset-token");
  if (!process.env.RESET_TOKEN || hdr !== process.env.RESET_TOKEN) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "users" ALTER COLUMN "emailVerified" DROP NOT NULL`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
