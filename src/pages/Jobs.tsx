
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type Job = {
  jobcode: string;
  jobdesc: string | null;
};

const Jobs = () => {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job')
        .select('*')
        .order('jobcode');
      
      if (error) throw new Error(error.message);
      return data as Job[];
    }
  });

  if (error) {
    console.error('Error loading jobs:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Job List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Code</TableHead>
                <TableHead>Job Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-60" /></TableCell>
                  </TableRow>
                ))
              ) : jobs?.length ? (
                jobs.map(job => (
                  <TableRow key={job.jobcode}>
                    <TableCell>{job.jobcode}</TableCell>
                    <TableCell>{job.jobdesc || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No jobs found.
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

export default Jobs;
