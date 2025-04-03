
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, profile } = useAuth();

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
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 hidden lg:flex"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Pyra HR</h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium">
                Welcome, {profile?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
              {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
