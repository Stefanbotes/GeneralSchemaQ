// app/api/admin/preview-instrument/route.ts
import { NextResponse } from 'next/server';
import instrument from '@/data/questionnaireData';
export const dynamic = 'force-dynamic';
export async function GET() {
  const d = (instrument as any)?.domains ?? [];
  const flat = d.flatMap((dom: any) =>
    (dom.schemas ?? []).flatMap((s: any) =>
      (s.items ?? []).map((it: any) => ({
        id: String(it.id),
        domain: String(dom.domain),
        schema: String(s.name),
        text: String(it.text),
      }))
    )
  );
  return NextResponse.json({ success: true, domains: d.length, items: flat.length, sample: flat.slice(0, 5) });
}
