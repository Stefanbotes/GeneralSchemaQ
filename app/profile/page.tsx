
// Profile page for user account management
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/profile');
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br bg-primary)50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Address
                </label>
                <p className="text-gray-900">{user?.email}</p>
                {user?.emailVerified ? (
                  <Badge variant="secondary" className="mt-1">Verified</Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">Not Verified</Badge>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Role
                </label>
                <Badge variant="outline" className="mt-1">
                  {user?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full" variant="default">
                    Go to Dashboard
                  </Button>
                </Link>
                
                <Link href="/assessment">
                  <Button className="w-full" variant="outline">
                    Take Assessment
                  </Button>
                </Link>

                <Button className="w-full" variant="outline" disabled>
                  Change Password (Coming Soon)
                </Button>

                <Button className="w-full" variant="outline" disabled>
                  Update Profile (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History Placeholder */}
        <Card className="bg-white shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary600" />
              Assessment History
            </CardTitle>
            <CardDescription>
              Your past assessment results and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No assessments completed yet.</p>
              <p className="text-sm">Start your first leadership assessment to see your results here.</p>
              <Link href="/assessment">
                <Button className="mt-4">
                  Take Assessment Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
