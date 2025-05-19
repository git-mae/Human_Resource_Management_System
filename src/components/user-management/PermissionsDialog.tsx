
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { UserData, UserPermission } from '@/types/user-management';

interface PermissionsDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionChange: (field: keyof UserPermission, value: boolean) => void;
}

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({
  user,
  open,
  onOpenChange,
  onPermissionChange
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Permissions for {user.name}</DialogTitle>
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
                checked={user.permissions?.can_add_employee} 
                onCheckedChange={(checked) => onPermissionChange('can_add_employee', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-employee">Edit Employees</Label>
              <Switch 
                id="edit-employee" 
                checked={user.permissions?.can_edit_employee} 
                onCheckedChange={(checked) => onPermissionChange('can_edit_employee', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delete-employee">Delete Employees</Label>
              <Switch 
                id="delete-employee" 
                checked={user.permissions?.can_delete_employee} 
                onCheckedChange={(checked) => onPermissionChange('can_delete_employee', checked)}
              />
            </div>

            <h3 className="font-semibold mt-6">Job Table</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="add-job">Add Jobs</Label>
              <Switch 
                id="add-job" 
                checked={user.permissions?.can_add_job} 
                onCheckedChange={(checked) => onPermissionChange('can_add_job', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-job">Edit Jobs</Label>
              <Switch 
                id="edit-job" 
                checked={user.permissions?.can_edit_job} 
                onCheckedChange={(checked) => onPermissionChange('can_edit_job', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delete-job">Delete Jobs</Label>
              <Switch 
                id="delete-job" 
                checked={user.permissions?.can_delete_job} 
                onCheckedChange={(checked) => onPermissionChange('can_delete_job', checked)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Department Table</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="add-department">Add Departments</Label>
              <Switch 
                id="add-department" 
                checked={user.permissions?.can_add_department} 
                onCheckedChange={(checked) => onPermissionChange('can_add_department', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-department">Edit Departments</Label>
              <Switch 
                id="edit-department" 
                checked={user.permissions?.can_edit_department} 
                onCheckedChange={(checked) => onPermissionChange('can_edit_department', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delete-department">Delete Departments</Label>
              <Switch 
                id="delete-department" 
                checked={user.permissions?.can_delete_department} 
                onCheckedChange={(checked) => onPermissionChange('can_delete_department', checked)}
              />
            </div>

            <h3 className="font-semibold mt-6">Job History Table</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="add-jobhistory">Add Job History</Label>
              <Switch 
                id="add-jobhistory" 
                checked={user.permissions?.can_add_jobhistory} 
                onCheckedChange={(checked) => onPermissionChange('can_add_jobhistory', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-jobhistory">Edit Job History</Label>
              <Switch 
                id="edit-jobhistory" 
                checked={user.permissions?.can_edit_jobhistory} 
                onCheckedChange={(checked) => onPermissionChange('can_edit_jobhistory', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="delete-jobhistory">Delete Job History</Label>
              <Switch 
                id="delete-jobhistory" 
                checked={user.permissions?.can_delete_jobhistory} 
                onCheckedChange={(checked) => onPermissionChange('can_delete_jobhistory', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
