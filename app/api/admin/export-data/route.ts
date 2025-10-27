
// API route for admin data export
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Get all assessment data with user information
    const assessments = await db.assessment.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all users for additional context
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      return exportAsCSV(assessments, users);
    } else {
      return exportAsJSON(assessments, users);
    }
    
  } catch (error) {
    console.error('Admin export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function exportAsCSV(assessments: any[], user: any[]) {
  // Create CSV for assessments
  const assessmentHeaders = [
    'Assessment_ID',
    'User_ID',
    'User_Name',
    'User_Email',
    'Status',
    'Leadership_Persona',
    'Started_Date',
    'Completed_Date',
    'Terms_Agreed',
    'Response_Count'
  ];

  const assessmentRows = assessments.map(assessment => {
    const responseCount = assessment.responses ? 
      (typeof assessment.responses === 'object' && assessment.responses !== null ? 
        Object.keys(assessment.responses).length : 0) : 0;
    
    return [
      assessment.id,
      assessment.users?.id || 'Unknown',
      `${assessment.users?.firstName || ''} ${assessment.users?.lastName || ''}`.trim(),
      assessment.users?.email || 'Unknown',
      assessment.status,
      assessment.leadershipPersona || 'Not Identified',
      assessment.startedAt?.toISOString() || 'Not Started',
      assessment.completedAt?.toISOString() || 'Not Completed',
      assessment.agreedToTerms ? 'Yes' : 'No',
      responseCount
    ];
  });

  const assessmentCSV = [assessmentHeaders, ...assessmentRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create CSV for users
  const userHeaders = [
    'User_ID',
    'First_Name',
    'Last_Name', 
    'Email',
    'Role',
    'Email_Verified',
    'Registration_Date',
    'Last_Login'
  ];

  const userRows = user.map(user => [
    user.id,
    user.firstName || '',
    user.lastName || '',
    user.email,
    user.role,
    user.emailVerified ? 'Yes' : 'No',
    user.createdAt?.toISOString() || '',
    user.lastLogin?.toISOString() || 'Never'
  ]);

  const userCSV = [userHeaders, ...userRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Combine both datasets
  const combinedCSV = `ASSESSMENTS\n${assessmentCSV}\n\n\nUSERS\n${userCSV}`;

  return new NextResponse(combinedCSV, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leadership_assessment_data_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

function exportAsJSON(assessments: any[], user: any[]) {
  const exportData = {
    exportDate: new Date().toISOString(),
    summary: {
      totalAssessments: assessments.length,
      totaluser: user.length,
      completedAssessments: assessments.filter(a => a.status === 'COMPLETED').length,
      inProgressAssessments: assessments.filter(a => a.status === 'IN_PROGRESS').length,
      verifieduser: users.filter(u => u.emailVerified).length,
    },
    assessments: assessments.map(assessment => {
      const responseCount = assessment.responses ? 
        (typeof assessment.responses === 'object' && assessment.responses !== null ? 
          Object.keys(assessment.responses).length : 0) : 0;
      
      return {
        id: assessment.id,
        userId: assessment.users?.id,
        userName: `${assessment.users?.firstName || ''} ${assessment.users?.lastName || ''}`.trim(),
        userEmail: assessment.users?.email,
        status: assessment.status,
        leadershipPersona: assessment.leadershipPersona,
        agreedToTerms: assessment.agreedToTerms,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        createdAt: assessment.createdAt,
        responseCount,
        responses: assessment.responses, // Include full response data
        results: assessment.results, // Include analysis results
      };
    }),
    user: users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      registrationDate: user.createdAt,
      lastLogin: user.lastLogin,
    }))
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="leadership_assessment_data_${new Date().toISOString().split('T')[0]}.json"`
    }
  });
}
