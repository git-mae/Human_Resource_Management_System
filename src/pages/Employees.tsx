
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

// Define the employee type based on the Supabase table structure
type Employee = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  birthdate: string | null;
  hiredate: string | null;
  sepdate: string | null;
};

const Employees = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch employees from Supabase
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .order('lastname', { ascending: true });
      
      if (error) throw error;
      return data as Employee[];
    }
  });

  // Calculate pagination
  const totalPages = employees ? Math.ceil(employees.length / itemsPerPage) : 0;
  const paginatedEmployees = employees?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
              <Users size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees in the organization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Complete list of employees in the organization</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              Error loading employees: {(error as Error).message}
            </div>
          ) : employees?.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No employees found.
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>List of all employees</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Separation Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees?.map((employee) => (
                    <TableRow key={employee.empno}>
                      <TableCell className="font-medium">{employee.empno}</TableCell>
                      <TableCell>
                        {employee.firstname || ''} {employee.lastname || ''}
                      </TableCell>
                      <TableCell>{employee.gender || 'N/A'}</TableCell>
                      <TableCell>{formatDate(employee.birthdate)}</TableCell>
                      <TableCell>{formatDate(employee.hiredate)}</TableCell>
                      <TableCell>{employee.sepdate ? formatDate(employee.sepdate) : 'Active'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
