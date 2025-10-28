// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").toLowerCase().trim();
    const token = url.searchParams.get("token") || "";

    if (!email || !token) {
      return NextResponse.json({ ok: false, error: "Missing email or token" }, { status: 400 });
    }

    // Hash incoming plaintext to match what we stored
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // If your Prisma model includes @@unique([identifier, token]),
    // Prisma exposes a compound unique finder alias like identifier_token
    const record = await db.verificationToken.findFirst({
      where: { identifier: email, token: hashed },
      select: { identifier: true, expires: true },
    });

    if (!record) {
      return NextResponse.json({ ok: false, error: "Invalid or already used token" }, { status: 400 });
    }
    if (record.expires && record.expires < new Date()) {
      // Cleanup expired token
      await db.verificationToken.deleteMany({ where: { identifier: email } });
      return NextResponse.json({ ok: false, error: "Token expired" }, { status: 400 });
    }

    // Mark user as verified
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Remove all tokens for this email
    await db.verificationToken.deleteMany({ where: { identifier: email } });

    // Optionally redirect to a nice page:
    // return NextResponse.redirect(new URL("/auth/login?verified=1", url.origin));

    return NextResponse.json({ ok: true, message: "Email verified" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "verify failed" }, { status: 500 });
  }
}
