
export const dynamic = 'force-dynamic';
import { loadMappingArray } from '@/lib/shared-lasbi-mapping';

export async function GET() {
  try {
    const arr = await loadMappingArray();
    const schemas = Array.from(new Set(arr.map(x => x.schemaLabel)));
    const perSchema: Record<string, number> = {};
    for (const s of schemas) perSchema[s] = arr.filter(x => x.schemaLabel === s).length;

    return Response.json({
      items: arr.length,           // expect 54
      uniqueSchemas: schemas.length, // expect 18
      perSchema                    // expect each = 3
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
