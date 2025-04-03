
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Building2, 
  ChevronLeft,
  ClipboardList, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
};

const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { logout, profile } = useAuth();
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
      label: 'Departments', 
      icon: <Building2 size={20} />, 
      href: '/departments' 
    },
    { 
      label: 'Jobs', 
      icon: <Briefcase size={20} />, 
      href: '/jobs' 
    },
    { 
      label: 'Job History', 
      icon: <ClipboardList size={20} />, 
      href: '/job-history' 
    },
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
          {!isCollapsed && <span className="font-bold text-lg">Crew Compass</span>}
          {isCollapsed && <Home size={24} className="text-sidebar-primary" />}
        </div>
        
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
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
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
          ))}
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
