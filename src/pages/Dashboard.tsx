
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, Users, Clock } from 'lucide-react';

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon,
  isLoading = false
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
  isLoading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          value
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employeeCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employee')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  const { data: departments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departmentCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('department')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('job')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  const { data: recentTransfers, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['recentTransfersCount'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('jobhistory')
        .select('*', { count: 'exact', head: true })
        .gte('effdate', thirtyDaysAgo.toISOString().split('T')[0]);
      
      if (error) throw new Error(error.message);
      return count || 0;
    }
  });

  // Dashboard data from queries
  const dashboardData = {
    totalEmployees: isLoadingEmployees ? "Loading..." : String(employees),
    departments: isLoadingDepartments ? "Loading..." : String(departments),
    jobs: isLoadingJobs ? "Loading..." : String(jobs),
    recentTransfers: isLoadingTransfers ? "Loading..." : String(recentTransfers)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Employees"
          value={dashboardData.totalEmployees}
          description="Active employees in the organization"
          icon={<Users size={18} />}
          isLoading={isLoadingEmployees}
        />
        <DashboardCard
          title="Departments"
          value={dashboardData.departments}
          description="Company departments"
          icon={<Building2 size={18} />}
          isLoading={isLoadingDepartments}
        />
        <DashboardCard
          title="Job Positions"
          value={dashboardData.jobs}
          description="Available job positions"
          icon={<Briefcase size={18} />}
          isLoading={isLoadingJobs}
        />
        <DashboardCard
          title="Recent Transfers"
          value={dashboardData.recentTransfers}
          description="Job transfers in the last 30 days"
          icon={<Clock size={18} />}
          isLoading={isLoadingTransfers}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <CardDescription>Department-wise employee distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Department chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest HR activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "New employee John Doe joined Engineering",
                "Sarah Johnson transferred to Marketing",
                "Michael Brown promoted to Senior Developer",
                "IT Department budget approved",
                "Performance reviews scheduled for next month"
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-md border p-3">
                  <div className="h-2 w-2 rounded-full bg-brand-600"></div>
                  <p className="text-sm">{activity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
