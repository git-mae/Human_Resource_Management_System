
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AvatarUpload from '@/components/user/AvatarUpload';
import { Pencil } from 'lucide-react';

interface AccountSettingsProps {
  onOpenProfileEdit: () => void;
}

const AccountSettings = ({ onOpenProfileEdit }: AccountSettingsProps) => {
  const { user, profile } = useAuth();
  const [avatarKey, setAvatarKey] = useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Manage your account settings and profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <AvatarUpload 
              user={user} 
              onAvatarUpdated={() => setAvatarKey(prev => prev + 1)} 
            />
          </div>
          
          <div className="flex-grow space-y-4">
            <div>
              <h3 className="text-lg font-medium">Profile Information</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{profile?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{profile?.role || 'User'}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onOpenProfileEdit} 
                className="mt-4" 
                variant="outline" 
                size="sm"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
