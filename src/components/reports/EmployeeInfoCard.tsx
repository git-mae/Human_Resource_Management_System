
import { EmployeeWithJobs } from '@/types/job-history';
import { format } from 'date-fns';

interface EmployeeInfoCardProps {
  employee: EmployeeWithJobs;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'PP');
  } catch (error) {
    return 'Invalid date';
  }
};

export const EmployeeInfoCard = ({ employee }: EmployeeInfoCardProps) => {
  return (
    <div className="mb-6 bg-muted p-4 rounded-md">
      <h3 className="font-semibold text-lg mb-2">{employee.firstname} {employee.lastname}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Employee ID</p>
          <p>{employee.empno}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Hire Date</p>
          <p>{formatDate(employee.hiredate)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p>{employee.sepdate ? `Separated: ${formatDate(employee.sepdate)}` : 'Active'}</p>
        </div>
      </div>
    </div>
  );
};
