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

    // Hash incoming plaintext to match stored value
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // Fetch token record first
    const record = await db.verificationToken.findFirst({
      where: { identifier: email, token: hashed },
      select: { identifier: true, expires: true },
    });

    if (!record) {
      return NextResponse.json({ ok: false, error: "Invalid or already used token" }, { status: 400 });
    }

    if (record.expires && record.expires < new Date()) {
      // Clean up expired tokens for this identifier and report expiry
      await db.verificationToken.deleteMany({ where: { identifier: email } });
      return NextResponse.json({ ok: false, error: "Token expired" }, { status: 400 });
    }

    // Transaction: verify user + clear all tokens
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true, emailVerified: true },
      });

      if (!user) {
        // User no longer exists — remove tokens and abort gracefully
        await tx.verificationToken.deleteMany({ where: { identifier: email } });
        return { ok: false as const, reason: "Account not found" };
      }

      // Mark verified and (optionally) bump tokenVersion to refresh sessions
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          tokenVersion: { increment: 1 },
        },
      });

      // Remove all tokens for this identifier
      await tx.verificationToken.deleteMany({ where: { identifier: email } });

      return { ok: true as const };
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
    }

    // Prefer a redirect UX (uncomment to use)
    // return NextResponse.redirect(new URL("/auth/login?verified=1", url.origin), { status: 302 });

    return NextResponse.json({ ok: true, message: "Email verified" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "verify failed" }, { status: 500 });
  }
}

