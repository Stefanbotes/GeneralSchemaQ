// Health/status + show which DB URL is in use (redacted)
export async function GET() {
  try {
    const [qCount, lCount] = await Promise.all([
      db.assessment_questions.count(),
      db.lasbi_items.count(),
    ]);

    // Prefer PRISMA_DATABASE_URL (if you switched schema.prisma),
    // otherwise fall back to DATABASE_URL so we always get an answer.
    const raw =
      process.env.PRISMA_DATABASE_URL ||
      process.env.DATABASE_URL ||
      '';

    const using =
      raw.includes('accelerate.prisma-data.net')
        ? '✅ Accelerate (Independent Clone DB)'
        : raw.includes('db.prisma.io')
        ? '⚠️ Prisma Cloud Postgres (shared)'
        : raw
        ? '❓ Unknown URL'
        : '🚫 No DB URL in env';

    // Redact secrets: show only host
    let host = 'unparsable';
    try {
      const normalized = raw.replace(/^prisma\+/, ''); // URL() doesn’t like prisma+ scheme
      const u = new URL(normalized);
      host = `${u.protocol}//${u.host}`;
    } catch {
      if (raw.startsWith('prisma+postgres://accelerate.prisma-data.net')) {
        host = 'prisma+postgres://accelerate.prisma-data.net';
      } else if (raw.includes('@')) {
        host = 'redacted';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        questionsInDatabase: qCount,
        lasbiItemsInDatabase: lCount,
        isSeeded: qCount > 0 && lCount > 0,
        status: qCount > 0 ? 'seeded' : 'empty',
        using,
        host,
      },
    });
  } catch (err: any) {
    console.error('Seed status error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
