
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft,
  FileText, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '@/components/user/UserAvatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
};

const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { logout, profile, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      href: '/dashboard' 
    },
    { 
      label: 'Employees', 
      icon: <Users size={20} />, 
      href: '/employees' 
    },
    { 
      label: 'Reports', 
      icon: <FileText size={20} />, 
      href: '/reports' 
    },
    ...(isAdmin ? [{ 
      label: 'User Management', 
      icon: <UserCog size={20} />, 
      href: '/user-management' 
    }] : []),
    { 
      label: 'Settings', 
      icon: <Settings size={20} />, 
      href: '/settings' 
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn("flex items-center overflow-hidden", 
          isCollapsed ? "justify-center w-full" : "justify-start space-x-2"
        )}>
          {!isCollapsed && <span className="font-bold text-lg">Pyra</span>}
          {isCollapsed && <Home size={24} className="text-sidebar-primary" />}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "hidden"
                )}
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronLeft size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Collapse sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <TooltipProvider key={item.href}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-0"
                      )
                    }
                  >
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center mb-3", isCollapsed ? "justify-center" : "")}>
          {!isCollapsed && <div className="mr-3">
            <UserAvatar user={user} size="sm" />
          </div>}
          
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
            </div>
          )}
          
          {isCollapsed && <UserAvatar user={user} size="sm" />}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                {!isCollapsed && <span className="ml-2">Logout</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DashboardSidebar;
