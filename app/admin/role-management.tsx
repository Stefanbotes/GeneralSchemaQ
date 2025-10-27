'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'COACH' | 'ADMIN' | string;
  emailVerified: boolean | Date | null;
}

interface RoleManagementProps {
  users: UserData[];
}

export function RoleManagement({ users: initialUsers }: RoleManagementProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'CLIENT' | 'COACH' | 'ADMIN' | string) => {
    try {
      setUpdating(userId);
      toast.loading('Updating user role...');

      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to update role');

      // ✅ fix: use `users` (plural) here
      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));

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
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'COACH':
        return 'bg-indigo-100 text-indigo-800';
      case 'CLIENT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white shadow-lg border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-indigo-600" />
          Role Management (Users: {users?.length || 0})
        </CardTitle>
        <CardDescription>Manage user roles and access permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {!users || users.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-600">No users to display.</div>
        ) : (
          <div className="overflow-x-auto">
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
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <Badge className={getRoleBadgeColor(u.role)}>{u.role}</Badge>
                    </td>
                    <td className="py-3">
                      <Select
                        value={u.role}
                        onValueChange={(newRole) => handleRoleChange(u.id, newRole)}
                        disabled={updating === u.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLIENT">CLIENT</SelectItem>
                          <SelectItem value="COACH">COACH</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3">
                      {u.emailVerified ? (
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
      </CardContent>
    </Card>
  );
}
