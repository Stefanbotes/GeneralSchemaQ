import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";        // needed because bcrypt/crypto require Node runtime
export const dynamic = "force-dynamic"; // avoids edge caching issues for admin ops

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Guard: require reset token header to match env
    const hdr = req.headers.get("x-reset-token");
    if (!process.env.RESET_TOKEN || hdr !== process.env.RESET_TOKEN) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Parse payload (with fallbacks to env)
    const body = await req.json().catch(() => ({} as any));
    const email = String(body.email || process.env.OWNER_EMAIL || "").toLowerCase().trim();
    const password = String(body.password || "");
    const firstName = String(body.firstName || "Stefan");
    const lastName = String(body.lastName || "Botes");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "email & password required" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    // Upsert owner as ADMIN — use Prisma.UserRole enum (robust across versions)
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: Prisma.UserRole.ADMIN, emailVerified: new Date() },
      create: {
        email,
        firstName,
        lastName,
        password: hash,
        role: Prisma.UserRole.ADMIN,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true, /* optional: firstName, lastName */ },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
