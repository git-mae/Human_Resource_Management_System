
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Reports from "@/pages/Reports";
import UserManagement from "@/pages/UserManagement";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

// Create a new instance of QueryClient with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <EmployeeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="employees" element={<Employees />} />
                      <Route path="reports" element={<Reports />} />
                      {/* Admin-only route */}
                      <Route path="user-management" element={
                        <ProtectedRoute requiredRole="admin">
                          <UserManagement />
                        </ProtectedRoute>
                      } />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    
                    {/* Not found route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </EmployeeProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
