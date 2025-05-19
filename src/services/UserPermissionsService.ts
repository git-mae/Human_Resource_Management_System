
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, isAdmin } = useAuth();

  const checkPermission = (permissionKey: keyof typeof permissions) => {
    // If admin, they have all permissions
    if (isAdmin) return true;

    // If permissions exist and the specific permission is granted
    if (permissions && permissions[permissionKey]) {
      return true;
    }

    return false;
  };

  return {
    // Employee permissions
    canAddEmployee: () => checkPermission('can_add_employee'),
    canEditEmployee: () => checkPermission('can_edit_employee'),
    canDeleteEmployee: () => checkPermission('can_delete_employee'),
    
    // Job permissions
    canAddJob: () => checkPermission('can_add_job'),
    canEditJob: () => checkPermission('can_edit_job'),
    canDeleteJob: () => checkPermission('can_delete_job'),
    
    // Department permissions
    canAddDepartment: () => checkPermission('can_add_department'),
    canEditDepartment: () => checkPermission('can_edit_department'),
    canDeleteDepartment: () => checkPermission('can_delete_department'),
    
    // Job history permissions
    canAddJobHistory: () => checkPermission('can_add_jobhistory'),
    canEditJobHistory: () => checkPermission('can_edit_jobhistory'),
    canDeleteJobHistory: () => checkPermission('can_delete_jobhistory'),
  };
};
