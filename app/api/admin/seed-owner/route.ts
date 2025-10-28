import { NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // simple header guard — set RESET_TOKEN in Vercel env first
  const hdr = req.headers.get("x-reset-token");
  if (!process.env.RESET_TOKEN || hdr !== process.env.RESET_TOKEN) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email || process.env.OWNER_EMAIL || "").toLowerCase().trim();
  const password = body.password as string;
  const firstName = body.firstName || "Stefan";
  const lastName = body.lastName || "Botes";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "email & password required" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.ADMIN, emailVerified: new Date() },
    create: {
      email,
      firstName,
      lastName,
      password: hash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
