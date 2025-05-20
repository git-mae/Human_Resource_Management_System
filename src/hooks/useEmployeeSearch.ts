
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeWithJobs, JobHistory } from '@/types/job-history';

export const useEmployeeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeData, setEmployeeData] = useState<EmployeeWithJobs | null>(null);
  
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['employeeJobReport', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;

      const { data: employee, error: empError } = await supabase
        .from('employee')
        .select('*')
        .or(`firstname.ilike.%${searchQuery}%,lastname.ilike.%${searchQuery}%,empno.ilike.%${searchQuery}%`)
        .limit(1)
        .single();
      
      if (empError) {
        console.error('Error fetching employee:', empError);
        throw new Error('Employee not found');
      }

      if (!employee) return null;
      
      const { data: jobHistory, error: jobError } = await supabase
        .from('jobhistory')
        .select(`
          *,
          job:jobcode(jobdesc),
          department:deptcode(deptname)
        `)
        .eq('empno', employee.empno)
        .order('effdate', { ascending: false });
      
      if (jobError) {
        console.error('Error fetching job history:', jobError);
        throw new Error('Could not fetch job history');
      }

      const formattedJobHistory: JobHistory[] = jobHistory.map(job => ({
        empno: job.empno,
        jobcode: job.jobcode,
        deptcode: job.deptcode,
        effdate: job.effdate,
        salary: job.salary,
        jobdesc: job.job?.jobdesc || null,
        deptname: job.department?.deptname || null,
        firstname: employee.firstname,
        lastname: employee.lastname
      }));

      return {
        ...employee,
        jobHistory: formattedJobHistory
      } as EmployeeWithJobs;
    },
    enabled: false
  });

  // Update employeeData when searchResults change
  if (searchResults && searchResults !== employeeData) {
    setEmployeeData(searchResults);
  }

  return {
    searchQuery,
    setSearchQuery,
    employeeData,
    isLoading,
    error,
    refetch
  };
};
