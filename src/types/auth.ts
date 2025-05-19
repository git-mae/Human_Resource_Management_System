
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'blocked';
};

export type UserPermissions = {
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

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
