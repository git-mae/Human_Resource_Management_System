
export type UserData = {
  id: string;
  name: string | null;
  role: string | null;
  created_at: string | null;
  email: string;
  permissions?: UserPermission;
};

export type UserPermission = {
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
