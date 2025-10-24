
// API route to fetch assessment questions from database (canonical source)
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active questions ordered by their sequence
    const questions = await db.assessment_questions.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        order: true,
        domain: true,
        schema: true,
        persona: true,
        healthyPersona: true,
        statement: true
      }
    });

    // Transform to frontend format with all canonical fields
    const transformedQuestions = questions.map((q: any) => ({
      id: q.id,
      order: q.order,
      domain: q.domain,
      schema: q.schema,
      persona: q.persona,
      healthyPersona: q.healthyPersona,
      statement: q.statement,
      type: 'likert-5' // All questions are Likert scale
    }));

    return NextResponse.json({
      questions: transformedQuestions,
      total: questions.length,
      success: true,
      metadata: {
        schemas: [...new Set(questions.map((q: any) => q.schema))].length,
        domains: [...new Set(questions.map((q: any) => q.domain))].length
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment questions', success: false },
      { status: 500 }
    );
  }
}
