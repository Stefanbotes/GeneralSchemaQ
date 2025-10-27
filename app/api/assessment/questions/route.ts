// app/api/assessment/questions/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await db.assessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        domain: true,
        schema: true,
        statement: true,
        // keep these if you actually use them on the client:
        persona: true,
        healthyPersona: true,
      },
    });

    const questions = rows.map((q) => ({
      id: q.id,
      order: q.order,
      domain: q.domain,
      schema: q.schema,
      statement: q.statement,
      persona: q.persona ?? null,
      healthyPersona: q.healthyPersona ?? null,
      type: 'likert-6', // UI has 6 options
    }));

    return NextResponse.json(
      {
        success: true,
        questions,
        total: questions.length,
        metadata: {
          schemas: new Set(questions.map((q) => q.schema)).size,
          domains: new Set(questions.map((q) => q.domain)).size,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('Error fetching questions:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment questions' },
      { status: 500 }
    );
  }
}
