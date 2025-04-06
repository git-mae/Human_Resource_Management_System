
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
import { Users, AlertCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Fetch employees from Supabase
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .order('lastname', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Employees data:', data);
      return data as Employee[];
    }
  });

  // If there's an error, show a toast notification
  if (error) {
    console.error('Error fetching employees:', error);
    toast.error('Failed to load employees');
  }

  // Filter employees based on search query
  const filteredEmployees = employees?.filter(employee => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${employee.firstname || ''} ${employee.lastname || ''}`.toLowerCase();
    
    return (
      employee.empno.toLowerCase().includes(query) || 
      fullName.includes(query)
    );
  });

  // Calculate pagination
  const totalPages = filteredEmployees ? Math.ceil(filteredEmployees.length / itemsPerPage) : 0;
  const paginatedEmployees = filteredEmployees?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-20" /> : employees?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active employees in the organization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Complete list of employees in the organization</CardDescription>
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by employee ID or name..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-red-500 p-8 text-center">
              <AlertCircle className="h-10 w-10 mb-2" />
              <h3 className="text-lg font-semibold">Error loading employees</h3>
              <p className="text-sm text-muted-foreground">
                {(error as Error).message || 'An unexpected error occurred'}
              </p>
            </div>
          ) : filteredEmployees?.length === 0 ? (
            <div className="text-center text-muted-foreground p-6">
              {searchQuery ? 'No employees match your search.' : 'No employees found.'}
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
