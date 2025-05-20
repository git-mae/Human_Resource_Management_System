
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeSelector from '@/components/settings/ThemeSelector';
import LanguageSelector from '@/components/settings/LanguageSelector';
import AccountSettings from '@/components/settings/AccountSettings';
import ProfileEditDialog from '@/components/ProfileEditDialog';

const Settings = () => {
  const [currentTab, setCurrentTab] = useState('display');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
      
      <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="display" className="space-y-4">
          <ThemeSelector />
          <LanguageSelector />
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <AccountSettings onOpenProfileEdit={() => setProfileDialogOpen(true)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
