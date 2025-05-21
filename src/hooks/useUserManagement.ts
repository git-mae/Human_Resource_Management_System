
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserPermission } from '@/types/user-management';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  // Check if user is super admin
  const isSuperAdmin = profile?.name === 'Rochel Mae Arcellas';

  // Fetch users with profiles, including their email from auth.users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
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

      // Fetch user emails through a Supabase function
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
      // Extra security check for super admin
      if (!isSuperAdmin) {
        // Check if the target user is admin
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (targetUser?.role === 'admin') {
          throw new Error('Only super admin can modify admin roles');
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Create notification for role change
      await supabase.from('notifications').insert({
        recipient_id: userId,
        message: `Your account role has been updated to ${role}`,
        type: role === 'blocked' ? 'warning' : 'info',
        is_global: false,
        is_read: false
      });
      
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
      // Extra security check for super admin
      if (!isSuperAdmin) {
        // Check if the target user is admin
        const { data: targetUser } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (targetUser?.role === 'admin') {
          throw new Error('Only super admin can modify admin permissions');
        }
      }
      
      const { error } = await supabase
        .from('user_permissions')
        .update(permissions)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Create notification for permission change
      await supabase.from('notifications').insert({
        recipient_id: userId,
        message: `Your permissions have been updated by an administrator`,
        type: 'info',
        is_global: false,
        is_read: false
      });
      
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
  
  // Handle restore dialog
  const openRestoreDialog = () => {
    setRestoreDialogOpen(true);
  };

  // Handle permissions change
  const handlePermissionChange = (field: keyof UserPermission, value: boolean) => {
    if (!selectedUser?.permissions) return;
    
    updatePermissionsMutation.mutate({
      userId: selectedUser.id,
      permissions: { [field]: value }
    });
  };

  return {
    users,
    filteredUsers,
    isLoading,
    error,
    selectedUser,
    permissionDialogOpen,
    restoreDialogOpen,
    currentTab,
    setSelectedUser,
    setPermissionDialogOpen,
    setRestoreDialogOpen,
    setCurrentTab,
    handleRoleChange,
    openPermissionsDialog,
    openRestoreDialog,
    handlePermissionChange
  };
};
