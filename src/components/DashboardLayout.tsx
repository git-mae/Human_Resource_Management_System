
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { ModeToggle } from './ModeToggle';
import { NotificationSystem } from './notifications/NotificationSystem';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, isAdmin, logout } = useAuth();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
              <Link className="flex items-center gap-2 font-semibold" to="/" title="Home">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 16V6H12V16H4ZM14 24V6H22V24H14Z"
                    fill="currentColor"
                  />
                </svg>
                {siteConfig.name}
              </Link>

              <div className="flex items-center gap-2">
                {isAuthenticated && <NotificationSystem />}
                {isAuthenticated ? (
                  <ProfileAvatar user={user} onLogout={handleLogout} />
                ) : (
                  <Button asChild>
                    <Link to="/login" title="Login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </header>
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 mt-4">
            {isAuthenticated ? (
              <>
                <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-80px)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                  <DashboardSidebar 
                    isAdmin={isAdmin} 
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                  />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                  {children}
                </main>
              </>
            ) : (
              <main className="flex-1">{children}</main>
            )}
          </div>
          <footer className="border-t py-4 md:px-8 md:py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
              </p>
              <ModeToggle />
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
