
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('hrms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, you would validate credentials with your backend
      // Mock for demo purposes
      const storedUsers = localStorage.getItem('hrms_users') || '[]';
      const users = JSON.parse(storedUsers);
      
      const matchedUser = users.find(
        (u: any) => u.email === email && u.password === password
      );
      
      if (!matchedUser) {
        toast.error('Invalid email or password');
        return false;
      }
      
      // Remove password from user object before storing in state
      const { password: _, ...userWithoutPassword } = matchedUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem('hrms_user', JSON.stringify(userWithoutPassword));
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, you would create a user in your backend
      // Mock for demo purposes
      const storedUsers = localStorage.getItem('hrms_users') || '[]';
      const users = JSON.parse(storedUsers);
      
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        toast.error('User with this email already exists');
        return false;
      }
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role: 'user',
      };
      
      users.push(newUser);
      localStorage.setItem('hrms_users', JSON.stringify(users));
      
      toast.success('Account created successfully. You can now log in.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
