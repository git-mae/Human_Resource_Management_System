
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Employees from './pages/Employees';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import JobHistory from './pages/JobHistory';
import JobHistoryReport from './pages/JobHistoryReport';

// Layouts
import DashboardLayout from './components/DashboardLayout';

// Providers
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { EmployeeProvider } from './contexts/EmployeeContext';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <EmployeeProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="job-history" element={<JobHistory />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="reports/job-history" element={<JobHistoryReport />} />
                    <Route path="user-management" element={<UserManagement />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster position="top-right" />
              </BrowserRouter>
            </EmployeeProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
