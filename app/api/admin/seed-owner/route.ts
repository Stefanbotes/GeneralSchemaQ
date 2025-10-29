import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";        // bcrypt/crypto need Node runtime
export const dynamic = "force-dynamic"; // avoid any caching for this admin op

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Require an admin reset token header
    const hdr = req.headers.get("x-reset-token");
    if (!process.env.RESET_TOKEN || hdr !== process.env.RESET_TOKEN) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Parse payload (with sensible defaults)
    const body = await req.json().catch(() => ({} as any));
    const email = String(body.email || process.env.OWNER_EMAIL || "").toLowerCase().trim();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "Stefan");
    const lastName = String(body.lastName || "Botes");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "email & password required" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    // Use string literal for enum to avoid Prisma enum typing issues
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", emailVerified: new Date() },
      create: {
        email,
        firstName,
        lastName,
        password: hash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

