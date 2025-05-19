
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user'; // Add optional role requirement
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error('Please log in to access this page');
        navigate('/login');
      } else if (profile?.role === 'blocked') {
        toast.error('Your account has been blocked. Please contact an administrator.');
        navigate('/login');
      } else if (requiredRole && profile?.role !== requiredRole) {
        toast.error(`You need ${requiredRole} permissions to access this page`);
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, navigate, profile, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (isAuthenticated && profile?.role !== 'blocked' && 
         (!requiredRole || profile?.role === requiredRole)) ? <>{children}</> : null;
};

export default ProtectedRoute;
