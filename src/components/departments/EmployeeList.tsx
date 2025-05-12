
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building } from 'lucide-react';

type Employee = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  jobcode?: string;
  jobdesc?: string | null;
};

type Department = {
  deptcode: string;
  deptname: string | null;
};

type EmployeeListProps = {
  employees: Employee[] | undefined;
  department: Department | undefined;
  isLoading: boolean;
  departmentCode: string;
};

const EmployeeList = ({ employees, department, isLoading, departmentCode }: EmployeeListProps) => {
  if (!departmentCode) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="mr-2 h-5 w-5" />
          Employees in {department?.deptname || departmentCode}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`emp-skeleton-${i}`} className="h-8 w-full" />
            ))}
          </div>
        ) : employees?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.empno}>
                  <TableCell>{emp.empno}</TableCell>
                  <TableCell>
                    {emp.firstname || ''} {emp.lastname || ''}
                  </TableCell>
                  <TableCell>{emp.jobdesc || '-'}</TableCell>
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
  );
};

export default EmployeeList;
