
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserTable from '@/components/user-management/UserTable';
import PermissionsDialog from '@/components/user-management/PermissionsDialog';

const UserManagement = () => {
  const { isAdmin, profile } = useAuth();
  const {
    filteredUsers,
    isLoading,
    error,
    selectedUser,
    permissionDialogOpen,
    currentTab,
    setPermissionDialogOpen,
    setCurrentTab,
    handleRoleChange,
    openPermissionsDialog,
    handlePermissionChange
  } = useUserManagement();

  // Create edge function for fetching emails
  useEffect(() => {
    const createEmailFunction = async () => {
      if (isAdmin) {
        // Check if function exists
        try {
          await supabase.functions.invoke('get-user-emails', {
            method: 'GET'
          });
        } catch (error) {
          console.error('You might need to create the get-user-emails function in Supabase');
        }
      }
    };
    
    createEmailFunction();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Users</h2>
        <p className="mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </div>
            <Button variant="default" disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
            </TabsList>
            
            <UserTable 
              users={filteredUsers}
              isLoading={isLoading}
              currentUserId={profile?.id}
              onRoleChange={handleRoleChange}
              onManagePermissions={openPermissionsDialog}
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      <PermissionsDialog
        user={selectedUser}
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onPermissionChange={handlePermissionChange}
      />
    </div>
  );
};

export default UserManagement;
