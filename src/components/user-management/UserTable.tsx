
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import { UserData } from '@/types/user-management';

interface UserTableProps {
  users: UserData[] | undefined;
  isLoading: boolean;
  currentUserId: string | undefined;
  onRoleChange: (userId: string, newRole: string) => void;
  onManagePermissions: (user: UserData) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  currentUserId,
  onRoleChange,
  onManagePermissions
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-60" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            </TableRow>
          ))
        ) : users?.length ? (
          users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || 'Unnamed User'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === 'admin' ? 'default' :
                    user.role === 'blocked' ? 'destructive' : 'outline'
                  }
                >
                  {user.role || 'user'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at || '').toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={user.id === currentUserId}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRoleChange(user.id, 'admin')}
                      disabled={user.role === 'admin'}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRoleChange(user.id, 'user')}
                      disabled={user.role === 'user'}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Set as User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRoleChange(user.id, 'blocked')}
                      disabled={user.role === 'blocked'}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Block User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManagePermissions(user)}>
                      Manage Permissions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
