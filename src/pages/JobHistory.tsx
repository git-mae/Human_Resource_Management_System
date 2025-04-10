
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
};

const JobHistory = () => {
  const { data: jobHistories, isLoading, error } = useQuery({
    queryKey: ['jobHistories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobhistory')
        .select(`
          *,
          employee:empno (firstname, lastname),
          job:jobcode (jobdesc),
          department:deptcode (deptname)
        `)
        .order('effdate', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  if (error) {
    console.error('Error loading job history:', error);
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Job History</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Job History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : jobHistories?.length ? (
                jobHistories.map((record, index) => (
                  <TableRow key={`${record.empno}-${record.jobcode}-${record.effdate}-${index}`}>
                    <TableCell>
                      {record.employee?.firstname || ''} {record.employee?.lastname || record.empno}
                    </TableCell>
                    <TableCell>{record.job?.jobdesc || record.jobcode}</TableCell>
                    <TableCell>{record.department?.deptname || record.deptcode || '-'}</TableCell>
                    <TableCell>{formatDate(record.effdate)}</TableCell>
                    <TableCell>{record.salary ? `$${record.salary.toLocaleString()}` : '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No job history records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobHistory;
