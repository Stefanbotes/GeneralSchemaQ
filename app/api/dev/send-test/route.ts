// app/api/dev/send-test/route.ts
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { to, url } = await req.json();
    if (!to || !url) {
      return NextResponse.json({ ok: false, error: "to & url required" }, { status: 400 });
    }
    const info = await sendVerificationEmail(to, url);
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    // Surfaces exact SMTP errors to you
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
