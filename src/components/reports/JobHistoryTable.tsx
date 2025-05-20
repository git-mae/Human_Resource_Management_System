
import { JobHistory } from '@/types/job-history';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface JobHistoryTableProps {
  jobHistory: JobHistory[];
  employeeName: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'PP');
  } catch (error) {
    return 'Invalid date';
  }
};

export const JobHistoryTable = ({ jobHistory, employeeName }: JobHistoryTableProps) => {
  return (
    <Table>
      <TableCaption>Job history for {employeeName}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Effective Date</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Salary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobHistory.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No job history records found
            </TableCell>
          </TableRow>
        ) : (
          jobHistory.map((job, index) => (
            <TableRow key={`${job.empno}-${job.jobcode}-${job.effdate}-${index}`}>
              <TableCell>{formatDate(job.effdate)}</TableCell>
              <TableCell>{job.jobdesc || job.jobcode}</TableCell>
              <TableCell>{job.deptname || job.deptcode || 'N/A'}</TableCell>
              <TableCell>
                {job.salary ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(job.salary) : 'N/A'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
