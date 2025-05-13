
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

type Department = {
  deptcode: string;
  deptname: string | null;
};

type DepartmentTableProps = {
  departments: Department[] | undefined;
  employeeCounts: Record<string, number> | undefined;
  selectedDepartment: string | null;
  isLoading: boolean;
  onDepartmentClick: (deptCode: string) => void;
};

const DepartmentTable = ({
  departments,
  employeeCounts,
  selectedDepartment,
  isLoading,
  onDepartmentClick,
}: DepartmentTableProps) => {
  return (
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
        {isLoading ? (
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
                  onClick={() => onDepartmentClick(dept.deptcode)}
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
        {departments?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4">
              No matching departments found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DepartmentTable;
