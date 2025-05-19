
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, UserPermissions } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData as Profile);

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (permissionsError && permissionsError.code !== 'PGRST116') {
        console.error('Error fetching permissions:', permissionsError);
        return;
      }

      setPermissions(permissionsData as UserPermissions);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (data.user) {
        // Fetch the user profile to check if blocked
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
          
        if (profileData && profileData.role === 'blocked') {
          toast.error('Your account has been blocked. Please contact an administrator.');
          await supabase.auth.signOut();
          return false;
        }
        
        toast.success('Login successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return false;
      }
      
      toast.success('Account created successfully. Please check your email for verification.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred during signup');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  return {
    user,
    setUser,
    profile,
    setProfile,
    permissions,
    setPermissions,
    isLoading,
    setIsLoading,
    fetchProfile,
    refreshProfile,
    login,
    signup,
    logout
  };
};
