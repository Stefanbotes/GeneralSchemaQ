
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface RoleManagementProps {
  user: UserData[];
}

export function RoleManagement({ user: initialUsers }: RoleManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [updating, setUpdating] = useState<string | null>(null);

  // Debug: Log to see if component is being called
  console.log('RoleManagement component loaded with user:', initialUsers?.length || 0);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);
      toast.loading('Updating user role...');

      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.dismiss();
      toast.success(`Role updated to ${newRole}`);

    } catch (error) {
      console.error('Role update error:', error);
      toast.dismiss();
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'COACH': return 'bg-primary100 text-primary800';
      case 'CLIENT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white shadow-lg border-2 border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-indigo-600" />
          🔧 Role Management (user: {users?.length || 0})
        </CardTitle>
        <CardDescription>
          Manage user roles and access permissions - Component is now visible!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!users || users.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-red-600 font-bold mb-4">
              DEBUG: No users data received or empty array
            </div>
            <div className="text-sm text-gray-600">
              Initial users prop: {JSON.stringify(initialUsers?.slice(0, 2) || 'undefined')}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 p-3 bg-green-100 rounded">
              <strong>✅ Users loaded successfully: {users.length} users found</strong>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">User</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Current Role</th>
                  <th className="text-left py-3">Change Role</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{user.email}</td>
                  <td className="py-3">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIENT">CLIENT</SelectItem>
                        <SelectItem value="COACH">COACH</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3">
                    {user.emailVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Unverified</Badge>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Role Permissions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700">
            <div>
              <strong>CLIENT:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Take assessments</li>
                <li>• View personal results</li>
                <li>• Download reports</li>
              </ul>
            </div>
            <div>
              <strong>COACH:</strong>
              <ul className="mt-1 space-y-1">
                <li>• All CLIENT permissions</li>
                <li>• View coaching insights</li>
                <li>• Access detailed analytics</li>
              </ul>
            </div>
            <div>
              <strong>ADMIN:</strong>
              <ul className="mt-1 space-y-1">
                <li>• All permissions</li>
                <li>• User management</li>
                <li>• Data export tools</li>
                <li>• System administration</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
