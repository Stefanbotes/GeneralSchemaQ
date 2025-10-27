
// Dashboard page for authenticated users
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  User, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Trophy,
  Calendar,
  Users,
  Shield,
  Download
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch user's assessment data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  const latestAssessment = user.assessments?.[0];
  const completedAssessments = user.assessments?.filter((a: any) => a.status === 'COMPLETED').length || 0;
  
  // Calculate user stats
  const memberSince = user.createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br bg-primary)50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Track your Inner Personadevelopment journey and explore your growth opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </p>
                </div>
                <div className="p-3 bg-primary100 rounded-full">
                  <Shield className="h-6 w-6 text-primary600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAssessments}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-lg font-bold text-gray-900">{memberSince}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Assessment Status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Assessment Progress
              </CardTitle>
              <CardDescription>
                Your current Inner Personaassessment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge 
                      variant={
                        latestAssessment.status === 'COMPLETED' ? 'default' :
                        latestAssessment.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                      }
                    >
                      {latestAssessment.status.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>
                  
                  {latestAssessment.status === 'IN_PROGRESS' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                  )}

                  {latestAssessment.status === 'COMPLETED' && latestAssessment.leadershipPersona && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Trophy className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Assessment Complete!</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your Inner Persona: <strong>{latestAssessment.leadershipPersona}</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {latestAssessment.status !== 'COMPLETED' ? (
                      <Link href="/assessment">
                        <Button className="bg-gradient-to-r bg-primary)600 to-indigo-600 hover:bg-primary)700 hover:to-indigo-700">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Assessment
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link href="/results">
                          <Button variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                        </Link>
                        <form action="/api/reports/generate-tier1" method="POST" className="inline">
                          <input type="hidden" name="userId" value={session.user.id} />
                          <input type="hidden" name="assessmentId" value={latestAssessment.id} />
                          <Button 
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-primary100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayCircle className="h-8 w-8 text-primary600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Begin?</h3>
                    <p className="text-gray-600 mb-4">
                      Start your Inner Personaassessment to discover your unique Inner Persona.
                    </p>
                  </div>
                  
                  <Link href="/assessment">
                    <Button size="lg" className="bg-gradient-to-r bg-primary)600 to-indigo-600 hover:bg-primary)700 hover:to-indigo-700">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest assessment activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.assessments?.length > 0 ? (
                <div className="space-y-4">
                  {user.assessment.slice(0, 5).map((assessment: any) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Inner PersonaAssessment</p>
                        <p className="text-sm text-gray-600">
                          {assessment.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          assessment.status === 'COMPLETED' ? 'default' :
                          assessment.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                        }
                      >
                        {assessment.status.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm">Start your first assessment to see your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/assessment">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <PlayCircle className="h-8 w-8 mx-auto mb-2 text-primary600" />
                  <h3 className="font-semibold">Start Assessment</h3>
                  <p className="text-sm text-gray-600">Begin your Inner Personaevaluation</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">Update Profile</h3>
                  <p className="text-sm text-gray-600">Manage your account settings</p>
                </CardContent>
              </Card>
            </Link>

            {user.role === 'ADMIN' && (
              <Link href="/admin">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold">Admin Panel</h3>
                    <p className="text-sm text-gray-600">Manage users and system</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
