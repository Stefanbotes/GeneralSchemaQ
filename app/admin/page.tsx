// app/admin/page.tsx
// Admin dashboard for user management
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { db } from '@/lib/db';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, Shield, Mail, AlertCircle, User as UserIcon, Database, FileText,
} from 'lucide-react';
import { AdminClient } from './admin-client';
import { RoleManagement } from './role-management';
import { ReportGenerationInterface } from './report-generation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Require login
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  // Allow only ADMIN (bypass in dev if you want to preview layout)
  const isAdminAccess =
    session?.user?.role === 'ADMIN' || process.env.NODE_ENV === 'development';

  if (!isAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#fcd0b1]-100 p-6 flex items-center justify-center">
        <Card className="bg-white shadow-lg max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in with an admin account.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard data
  try {
    const [totaluser, totalAssessments, verifieduser, unverifieduser] =
      await Promise.all([
        db.users.count(),
        db.assessments.count(),
        db.users.count({ where: { emailVerified: { not: null } } }), // Date set => verified
        db.users.count({ where: { emailVerified: null } }), // null => unverified
      ]);

    const recentUsers = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true, // Date | null
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const usersWithCompletedAssessments = await db.user.findMany({
      where: {
        assessments: {
          some: { status: 'COMPLETED' },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        assessments: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            completedAt: true,
            leadershipPersona: true,
            status: true,
          },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#fcd0b1]-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and monitor system activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#fcd0b1]-600">{totaluser}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalAssessments}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Verified Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{verifieduser}</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Unverified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unverifieduser}</div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Export Tools (client component) */}
          <AdminClient
            stats={{
              totaluser,
              totalAssessments,
              verifieduser,
              unverifieduser,
            }}
          />

          {/* Role Management */}
          <RoleManagement users={recentUsers as any} />

          {/* Three-Tier Report Generation */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Advanced Report Generation
              </CardTitle>
              <CardDescription>
                Generate Tier 2 (Leadership) and Tier 3 (Clinical) reports for completed assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">Three-Tier Report System:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-100 rounded">
                      <strong>Tier 1: Summary</strong>
                      <p className="text-green-700 text-xs mt-1">
                        Auto-downloaded on completion. Gentle, strengths-focused (2-3 paragraphs)
                      </p>
                    </div>
                    <div className="p-3 bg-[#fcd0b1]-100 rounded">
                      <strong>Tier 2: Leadership</strong>
                      <p className="text-[#fcd0b1]-700 text-xs mt-1">
                        Professional development focus. Inner Personas (8-12 pages)
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded">
                      <strong>Tier 3: Clinical</strong>
                      <p className="text-red-700 text-xs mt-1">
                        Clinical supervision required. Schema therapy framework (12-15 pages)
                      </p>
                    </div>
                  </div>
                </div>

                <ReportGenerationInterface users={usersWithCompletedAssessments as any} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-[#fcd0b1]-600" />
                Recent Users
              </CardTitle>
              <CardDescription>Latest user registrations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers?.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 text-gray-600">{user.email}</td>
                        <td className="py-3">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="py-3">
                          {user.emailVerified ? (
                            <Badge variant="secondary">Verified</Badge>
                          ) : (
                            <Badge variant="destructive">Unverified</Badge>
                          )}
                        </td>
                        <td className="py-3 text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {recentUsers?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No users found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#fcd0b1]-100 p-6 flex items-center justify-center">
        <Card className="bg-white shadow-lg max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load admin dashboard data. Please check the database connection.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }
}
