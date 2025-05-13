
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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

const ITEMS_PER_PAGE = 5;

const EmployeeList = ({ employees, department, isLoading, departmentCode }: EmployeeListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  if (!departmentCode) return null;

  const totalEmployees = employees?.length || 0;
  const totalPages = Math.ceil(totalEmployees / ITEMS_PER_PAGE);
  
  const paginatedEmployees = employees?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        endPage = 3;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis if there's a gap at the beginning
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap at the end
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

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
        ) : totalEmployees > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees?.map(emp => (
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
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((page, i) => (
                      <PaginationItem key={`page-${i}`}>
                        {page === '...' ? (
                          <div className="flex h-9 w-9 items-center justify-center text-sm">...</div>
                        ) : (
                          <PaginationLink 
                            onClick={() => handlePageChange(page as number)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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
