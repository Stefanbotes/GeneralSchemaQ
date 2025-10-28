// app/api/whoami/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    signedIn: !!session,
    user: session?.user ?? null,
  });
}
