// app/profile/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const displayName =
    (user?.name ??
      `${(user as any)?.firstName ?? ''} ${(user as any)?.lastName ?? ''}`.trim()) || '-';

  const email = user?.email ?? '-';
  const role = (user as any)?.role ?? 'CLIENT';
  const isVerified = Boolean(user?.emailVerified); // Date | null -> boolean

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{displayName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <div>
                  <Badge variant="outline">{role}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Verification</label>
                <div>
                  {isVerified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Unverified</Badge>
                  )}
                </div>
              </div>
            </div>

            {!user && (
              <p className="text-sm text-gray-500">
                You&apos;re not signed in. Please log in to view your profile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

