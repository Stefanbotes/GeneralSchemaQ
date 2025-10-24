
// Results page for users to view and download their assessment reports
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Trophy, 
  Calendar,
  CheckCircle,
  AlertCircle,
  BarChart3,
  User,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { JsonExportButton } from '@/components/JsonExportButton';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/results');
  }

  // Fetch user's completed assessments
  const user = await db.users.findUnique({
    where: { id: session.user.id },
    include: {
      assessments: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  const completedAssessments = user.assessments || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h1>
          <p className="text-gray-600">
            View and download your completed leadership assessment reports
          </p>
        </div>

        {completedAssessments.length === 0 ? (
          /* No Completed Assessments */
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Completed Assessments</h3>
              <p className="text-gray-600 mb-6">
                You haven't completed any assessments yet. Start your leadership journey today!
              </p>
              <Link href="/assessment">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Display Completed Assessments */
          <div className="space-y-6">
            {completedAssessments.map((assessment: any) => (
              <Card key={assessment.id} className="bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-green-600" />
                        Leadership Assessment Complete
                      </CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        Completed on {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown'}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Leadership Persona Result */}
                  {assessment.leadershipPersona && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Your Leadership Persona
                      </h4>
                      <p className="text-lg font-bold text-blue-900 mb-2">
                        {assessment.leadershipPersona}
                      </p>
                      <p className="text-sm text-blue-700">
                        This persona represents your primary leadership patterns and natural strengths.
                      </p>
                    </div>
                  )}

                  {/* Download Reports Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Available Reports:</h4>
                    
                    {/* Tier 1 Report - Always available for completed assessments */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="h-4 w-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Personal Summary Report</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Your personalized leadership summary with key strengths and growth opportunities.
                        </p>
                      </div>
                      <form action="/api/reports/generate-tier1" method="POST" className="ml-4">
                        <input type="hidden" name="userId" value={session.user.id} />
                        <input type="hidden" name="assessmentId" value={assessment.id} />
                        <Button 
                          type="submit"
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </form>
                    </div>

                    {/* JSON Export */}
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Database className="h-4 w-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Assessment Data Export</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Structured JSON export of your assessment data for research or personal analysis.
                        </p>
                      </div>
                      <div className="ml-4">
                        <JsonExportButton 
                          userId={session.user.id}
                          assessmentId={assessment.id}
                          userName={`${user.firstName || 'User'} ${user.lastName || ''}`}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Info about advanced reports */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Advanced Reports:</strong> Detailed leadership and clinical reports are available through your organization's admin. 
                        Contact your administrator if you need access to comprehensive assessment analysis.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
