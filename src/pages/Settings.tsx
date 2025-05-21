
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AccountSettings from "@/components/settings/AccountSettings";
import ThemeSelector from "@/components/settings/ThemeSelector";
import LanguageSelector from "@/components/settings/LanguageSelector";
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileEditDialog from '@/components/ProfileEditDialog';

const Settings = () => {
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AccountSettings onOpenProfileEdit={() => setProfileEditOpen(true)} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize the appearance of the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ThemeSelector />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>
                  Choose your preferred language for the interface.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelector />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Notification preferences coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Profile edit dialog */}
        <ProfileEditDialog 
          open={profileEditOpen} 
          onOpenChange={setProfileEditOpen} 
        />
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
