
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building, Users } from 'lucide-react';

type Department = {
  deptcode: string;
  deptname: string | null;
};

type Employee = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  jobcode?: string;
  jobdesc?: string | null;
  deptname?: string | null;
};

const Departments = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const { data: departments, isLoading: loadingDepts, error: deptsError } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('department')
        .select('*')
        .order('deptcode');
      
      if (error) throw new Error(error.message);
      return data as Department[];
    }
  });

  const { data: employeeCounts, isLoading: loadingCounts } = useQuery({
    queryKey: ['departmentEmployeeCounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobhistory')
        .select('deptcode, empno')
        .is('status', null)
        .or('status.eq.active');
      
      if (error) throw new Error(error.message);
      
      // Count employees by department
      const counts: Record<string, number> = {};
      data.forEach(item => {
        if (item.deptcode) {
          counts[item.deptcode] = (counts[item.deptcode] || 0) + 1;
        }
      });
      
      return counts;
    }
  });

  const { data: departmentEmployees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['departmentEmployees', selectedDepartment],
    enabled: !!selectedDepartment,
    queryFn: async () => {
      // First get employee IDs from job history for the selected department
      const { data: jobData, error: jobError } = await supabase
        .from('jobhistory')
        .select('empno, jobcode')
        .eq('deptcode', selectedDepartment)
        .is('status', null)
        .or('status.eq.active');
      
      if (jobError) throw new Error(jobError.message);
      
      if (!jobData?.length) return [];
      
      // Get employee details for these IDs
      const employeeIds = jobData.map(job => job.empno);
      
      // Get employees
      const { data: employees, error: empError } = await supabase
        .from('employee')
        .select('empno, firstname, lastname')
        .in('empno', employeeIds);
        
      if (empError) throw new Error(empError.message);

      // Get job descriptions
      const { data: jobs, error: jobsError } = await supabase
        .from('job')
        .select('jobcode, jobdesc');

      if (jobsError) throw new Error(jobsError.message);

      // Get department name
      const { data: deptData, error: deptError } = await supabase
        .from('department')
        .select('deptcode, deptname')
        .eq('deptcode', selectedDepartment)
        .single();

      if (deptError) console.error('Error fetching department name:', deptError);
      
      // Merge employee data with job data
      return employees.map(emp => {
        const jobHistory = jobData.find(job => job.empno === emp.empno);
        const job = jobs.find(j => j.jobcode === jobHistory?.jobcode);
        
        return {
          ...emp,
          jobcode: jobHistory?.jobcode,
          jobdesc: job?.jobdesc,
          deptname: deptData?.deptname
        };
      }) as Employee[];
    }
  });

  if (deptsError) {
    console.error('Error loading departments:', deptsError);
  }

  const handleDepartmentClick = (deptCode: string) => {
    setSelectedDepartment(deptCode === selectedDepartment ? null : deptCode);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDepts || loadingCounts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : departments?.length ? (
                departments.map(dept => (
                  <TableRow key={dept.deptcode} className="group">
                    <TableCell>{dept.deptcode}</TableCell>
                    <TableCell>{dept.deptname || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{employeeCounts?.[dept.deptcode] || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDepartmentClick(dept.deptcode)}
                      >
                        {selectedDepartment === dept.deptcode ? 'Hide Employees' : 'View Employees'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No departments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {selectedDepartment && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Employees in {departments?.find(d => d.deptcode === selectedDepartment)?.deptname || selectedDepartment}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEmployees ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={`emp-skeleton-${i}`} className="h-8 w-full" />
                    ))}
                  </div>
                ) : departmentEmployees?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentEmployees.map(emp => (
                        <TableRow key={emp.empno}>
                          <TableCell>{emp.empno}</TableCell>
                          <TableCell>
                            {emp.firstname || ''} {emp.lastname || ''}
                          </TableCell>
                          <TableCell>{emp.jobdesc || '-'}</TableCell>
                          <TableCell>{emp.deptname || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No employees found for this department.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;
