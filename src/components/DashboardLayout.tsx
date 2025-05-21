
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileEditDialog from './ProfileEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { user, profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAvatar(user.id);
    }
  }, [user?.id]);

  const fetchAvatar = async (userId: string) => {
    try {
      const { data } = await supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar`);
      
      if (data?.publicUrl) {
        // Add a cache buster to prevent browser caching
        setAvatarUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isMobileSidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black/50" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-64">
          <DashboardSidebar 
            isCollapsed={false} 
            setIsCollapsed={() => {
              setIsMobileSidebarOpen(false);
            }} 
          />
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-background px-4 shadow-sm">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(true)}
                  >
                    <Menu size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Open Sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 hidden lg:flex"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  >
                    <Menu size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Toggle Sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <h1 className="text-xl font-semibold">PYRA HR</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                  >
                    <Bell size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Notifications
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div 
              className="text-sm cursor-pointer hover:underline"
              onClick={() => setProfileDialogOpen(true)}
            >
              <span className="font-medium">
                Welcome, {profile?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="cursor-pointer"
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="bg-brand-600 text-white">
                        {profile?.name?.charAt(0).toUpperCase() || 
                         user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Edit Profile
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
          <Outlet />
        </main>
      </div>

      <ProfileEditDialog 
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
};

export default DashboardLayout;
