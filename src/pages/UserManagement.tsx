
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MoreVertical, UserPlus, ShieldAlert, UserCheck, UserX } from 'lucide-react';

type UserData = {
  id: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
  email: string;
  permissions?: UserPermission;
};

type UserPermission = {
  id: string;
  can_add_employee: boolean;
  can_edit_employee: boolean;
  can_delete_employee: boolean;
  can_add_job: boolean;
  can_edit_job: boolean;
  can_delete_job: boolean;
  can_add_department: boolean;
  can_edit_department: boolean;
  can_delete_department: boolean;
  can_add_jobhistory: boolean;
  can_edit_jobhistory: boolean;
  can_delete_jobhistory: boolean;
};

const UserManagement = () => {
  const { isAdmin, profile } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const queryClient = useQueryClient();

  // Fetch users with profiles, including their email from auth.users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!isAdmin) throw new Error('Unauthorized');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Get all user permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');
        
      if (permissionsError) throw permissionsError;

      // Fetch user emails through a Supabase function (as we can't directly query auth.users)
      const { data: userEmails, error: emailsError } = await supabase.functions.invoke('get-user-emails');
      
      if (emailsError) {
        console.error('Error fetching user emails:', emailsError);
        // Continue without emails if there's an error
      }
      
      // Map permissions to profiles
      const usersWithPermissions = profiles.map((profile: any) => {
        const userPermission = permissions.find((p: any) => p.user_id === profile.id);
        const userEmail = userEmails?.find((u: any) => u.id === profile.id)?.email || 'Unknown';
        
        return {
          ...profile,
          email: userEmail,
          permissions: userPermission
        };
      });
      
      return usersWithPermissions as UserData[];
    },
    enabled: isAdmin,
  });

  // Filter users based on current tab
  const filteredUsers = users?.filter(user => {
    if (currentTab === 'all') return true;
    if (currentTab === 'admin') return user.role === 'admin';
    if (currentTab === 'user') return user.role === 'user';
    if (currentTab === 'blocked') return user.role === 'blocked';
    return true;
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User role updated to ${data.role}`);
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    }
  });

  // Update user permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: Partial<UserPermission> }) => {
      const { error } = await supabase
        .from('user_permissions')
        .update(permissions)
        .eq('user_id', userId);
        
      if (error) throw error;
      return { userId, permissions };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User permissions updated');
      setPermissionDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update permissions: ${error.message}`);
    }
  });

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  // Handle permissions dialog
  const openPermissionsDialog = (user: UserData) => {
    setSelectedUser(user);
    setPermissionDialogOpen(true);
  };

  // Handle permissions change
  const handlePermissionChange = (field: keyof UserPermission, value: boolean) => {
    if (!selectedUser?.permissions) return;
    
    updatePermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions: { [field]: value }
    });
  };

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
                ) : filteredUsers?.length ? (
                  filteredUsers.map(user => (
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
                          <DropdownMenuTrigger asChild disabled={user.id === profile?.id}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'user')}
                              disabled={user.role === 'user'}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.id, 'blocked')}
                              disabled={user.role === 'blocked'}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPermissionsDialog(user)}>
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
          </Tabs>
        </CardContent>
      </Card>

      {/* Permissions Dialog */}
      {selectedUser && (
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Permissions for {selectedUser.name}</DialogTitle>
              <DialogDescription>
                Configure what this user can do in the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Employee Table</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-employee">Add Employees</Label>
                  <Switch 
                    id="add-employee" 
                    checked={selectedUser.permissions?.can_add_employee} 
                    onCheckedChange={(checked) => handlePermissionChange('can_add_employee', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-employee">Edit Employees</Label>
                  <Switch 
                    id="edit-employee" 
                    checked={selectedUser.permissions?.can_edit_employee} 
                    onCheckedChange={(checked) => handlePermissionChange('can_edit_employee', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="delete-employee">Delete Employees</Label>
                  <Switch 
                    id="delete-employee" 
                    checked={selectedUser.permissions?.can_delete_employee} 
                    onCheckedChange={(checked) => handlePermissionChange('can_delete_employee', checked)}
                  />
                </div>

                <h3 className="font-semibold mt-6">Job Table</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-job">Add Jobs</Label>
                  <Switch 
                    id="add-job" 
                    checked={selectedUser.permissions?.can_add_job} 
                    onCheckedChange={(checked) => handlePermissionChange('can_add_job', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-job">Edit Jobs</Label>
                  <Switch 
                    id="edit-job" 
                    checked={selectedUser.permissions?.can_edit_job} 
                    onCheckedChange={(checked) => handlePermissionChange('can_edit_job', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="delete-job">Delete Jobs</Label>
                  <Switch 
                    id="delete-job" 
                    checked={selectedUser.permissions?.can_delete_job} 
                    onCheckedChange={(checked) => handlePermissionChange('can_delete_job', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Department Table</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-department">Add Departments</Label>
                  <Switch 
                    id="add-department" 
                    checked={selectedUser.permissions?.can_add_department} 
                    onCheckedChange={(checked) => handlePermissionChange('can_add_department', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-department">Edit Departments</Label>
                  <Switch 
                    id="edit-department" 
                    checked={selectedUser.permissions?.can_edit_department} 
                    onCheckedChange={(checked) => handlePermissionChange('can_edit_department', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="delete-department">Delete Departments</Label>
                  <Switch 
                    id="delete-department" 
                    checked={selectedUser.permissions?.can_delete_department} 
                    onCheckedChange={(checked) => handlePermissionChange('can_delete_department', checked)}
                  />
                </div>

                <h3 className="font-semibold mt-6">Job History Table</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-jobhistory">Add Job History</Label>
                  <Switch 
                    id="add-jobhistory" 
                    checked={selectedUser.permissions?.can_add_jobhistory} 
                    onCheckedChange={(checked) => handlePermissionChange('can_add_jobhistory', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-jobhistory">Edit Job History</Label>
                  <Switch 
                    id="edit-jobhistory" 
                    checked={selectedUser.permissions?.can_edit_jobhistory} 
                    onCheckedChange={(checked) => handlePermissionChange('can_edit_jobhistory', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="delete-jobhistory">Delete Job History</Label>
                  <Switch 
                    id="delete-jobhistory" 
                    checked={selectedUser.permissions?.can_delete_jobhistory} 
                    onCheckedChange={(checked) => handlePermissionChange('can_delete_jobhistory', checked)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
