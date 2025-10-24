// Protected API endpoint to seed assessment questions and LASBI items
// This should be called ONCE after deployment to populate the production database
// Requires ADMIN_SECRET_KEY environment variable for security

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel function timeout

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to load questionnaire data from the canonical source
function loadQuestionnaireData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'questionnaireData.js');
    const content = fs.readFileSync(dataPath, 'utf8');
    
    // Extract the questionnaireData object
    const match = content.match(/export const questionnaireData = ({[\s\S]*?});/);
    if (!match) {
      throw new Error('Could not parse questionnaireData from file');
    }
    
    // Use eval in this controlled server-side context
    const data = eval('(' + match[1] + ')');
    return data;
  } catch (error) {
    console.error('Error loading questionnaire data:', error);
    throw new Error(`Failed to load questionnaire data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security: Require admin secret key
    const adminSecret = request.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET_KEY;
    
    if (!expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Server configuration error: ADMIN_SECRET_KEY not set',
          success: false 
        },
        { status: 500 }
      );
    }
    
    if (adminSecret !== expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized: Invalid admin secret',
          success: false 
        },
        { status: 401 }
      );
    }

    // Check if questions already exist
    const existingCount = await db.assessment_questions.count();
    const existingLasbiCount = await db.lasbi_items.count();
    
    if (existingCount > 0 || existingLasbiCount > 0) {
      return NextResponse.json({
        message: 'Questions already exist in database. Use force=true to re-seed.',
        success: true,
        data: {
          existingQuestions: existingCount,
          existingLasbiItems: existingLasbiCount
        }
      });
    }

    // Load questionnaire data
    console.log('📚 Loading questionnaire data...');
    const questionnaireData = loadQuestionnaireData();
    
    if (!questionnaireData || !questionnaireData.sections) {
      throw new Error('Invalid questionnaire data structure');
    }

    console.log(`📝 Loaded ${questionnaireData.sections.length} domains`);
    
    // Count total items
    let totalItems = 0;
    questionnaireData.sections.forEach((section: any) => {
      section.variables.forEach((variable: any) => {
        totalItems += variable.questions.length;
      });
    });

    console.log(`📊 Total questions to seed: ${totalItems}`);

    // Seed questions and LASBI items
    let questionCount = 0;
    let lasbiCount = 0;

    for (const section of questionnaireData.sections) {
      const domain = section.name;
      
      for (const variable of section.variables) {
        const schemaLabel = variable.name;
        const persona = variable.persona;
        const healthyPersona = variable.healthyPersona;
        const variableId = variable.variableId;
        
        for (const question of variable.questions) {
          // Create assessment question
          await db.assessment_questions.create({
            data: {
              id: question.id,  // e.g., "1.1.1"
              order: question.order,
              domain: domain,
              schema: schemaLabel,
              persona: persona,
              healthyPersona: healthyPersona,
              statement: question.text,
              isActive: true
            }
          });
          questionCount++;
          
          // Extract question number from canonical ID (e.g., "1.1.1" -> 1)
          const questionNumber = parseInt(question.id.split('.')[2]);
          
          // Create LASBI item with modern item_id format
          const modernItemId = `cmf${question.id.replace(/\./g, '_')}`; // e.g., "cmf1_1_1"
          
          await db.lasbi_items.create({
            data: {
              item_id: modernItemId,
              canonical_id: question.id,
              variable_id: variableId,
              question_number: questionNumber,
              schema_label: schemaLabel
            }
          });
          lasbiCount++;
        }
      }
    }

    console.log('✅ Seeding completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Questions and LASBI items seeded successfully',
      data: {
        questionsCreated: questionCount,
        lasbiItemsCreated: lasbiCount,
        version: questionnaireData.version,
        domains: questionnaireData.sections.length
      }
    });

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed questions',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check seeding status
export async function GET(request: NextRequest) {
  try {
    const questionCount = await db.assessment_questions.count();
    const lasbiCount = await db.lasbi_items.count();
    
    return NextResponse.json({
      success: true,
      data: {
        questionsInDatabase: questionCount,
        lasbiItemsInDatabase: lasbiCount,
        isSeeded: questionCount > 0 && lasbiCount > 0,
        status: questionCount > 0 ? 'seeded' : 'empty'
      }
    });
  } catch (error) {
    console.error('Error checking seed status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check seed status',
        success: false 
      },
      { status: 500 }
    );
  }
}
