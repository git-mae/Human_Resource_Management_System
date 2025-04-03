
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, Users, Clock } from 'lucide-react';

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode 
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
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  // Mock data for dashboard
  const dashboardData = {
    totalEmployees: "124",
    departments: "8",
    jobs: "32",
    recentTransfers: "5"
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
        />
        <DashboardCard
          title="Departments"
          value={dashboardData.departments}
          description="Company departments"
          icon={<Building2 size={18} />}
        />
        <DashboardCard
          title="Job Positions"
          value={dashboardData.jobs}
          description="Available job positions"
          icon={<Briefcase size={18} />}
        />
        <DashboardCard
          title="Recent Transfers"
          value={dashboardData.recentTransfers}
          description="Job transfers in the last 30 days"
          icon={<Clock size={18} />}
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
