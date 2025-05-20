
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ThemeSelector from "@/components/settings/ThemeSelector";
import LanguageSelector from "@/components/settings/LanguageSelector";
import CurrencySelector from "@/components/settings/CurrencySelector";
import { Globe, Palette, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProfileEditDialog from "@/components/ProfileEditDialog";

const Settings = () => {
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Customization</CardTitle>
            <CardDescription>
              Adjust your application preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Palette className="h-5 w-5" />
                <Label>Theme</Label>
              </div>
              <ThemeSelector />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Globe className="h-5 w-5" />
                <Label>Language</Label>
              </div>
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5" />
                <Label>Preferred Currency</Label>
              </div>
              <CurrencySelector />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5" />
                <Label>Profile Settings</Label>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setProfileEditOpen(true)}
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Edit Dialog */}
      <ProfileEditDialog 
        open={profileEditOpen} 
        onOpenChange={setProfileEditOpen} 
      />
    </div>
  );
};

export default Settings;
