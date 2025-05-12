
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Department = {
  deptcode: string;
  deptname: string | null;
};

export const useDepartments = () => {
  return useQuery({
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
};

export const useDepartmentEmployeeCounts = () => {
  return useQuery({
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
};

export const useDepartmentEmployees = (selectedDepartment: string | null) => {
  return useQuery({
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
      
      // Merge employee data with job data
      return employees.map(emp => {
        const jobHistory = jobData.find(job => job.empno === emp.empno);
        const job = jobs.find(j => j.jobcode === jobHistory?.jobcode);
        
        return {
          ...emp,
          jobcode: jobHistory?.jobcode,
          jobdesc: job?.jobdesc
        };
      });
    }
  });
};
