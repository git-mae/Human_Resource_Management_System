import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileDown, AlertCircle, History } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  jobdesc: string | null;
  deptname: string | null;
  firstname: string | null;
  lastname: string | null;
};

type EmployeeWithJobs = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  birthdate: string | null;
  hiredate: string | null;
  sepdate: string | null;
  jobHistory: JobHistory[];
};

const Reports = () => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const generatePDF = () => {
    if (!employeeData) return;

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`Employee Job History Report`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Employee: ${employeeData.firstname} ${employeeData.lastname} (${employeeData.empno})`, 14, 32);
      doc.text(`Hire Date: ${format(new Date(employeeData.hiredate || ''), 'PP')}`, 14, 38);
      
      const tableColumn = ["Effective Date", "Job", "Department", "Salary"];
      const tableRows: string[][] = [];

      employeeData.jobHistory.forEach(job => {
        const formattedDate = format(new Date(job.effdate), 'PP');
        const salary = job.salary ? `$${job.salary.toLocaleString()}` : 'N/A';
        const jobData = [
          formattedDate,
          job.jobdesc || job.jobcode,
          job.deptname || job.deptcode || 'N/A',
          salary
        ];
        tableRows.push(jobData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: {
          fillColor: [66, 66, 66]
        }
      });

      const filename = `job_history_${employeeData.empno}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (searchResults && searchResults !== employeeData) {
    setEmployeeData(searchResults);
  }

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
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Job History Report</CardTitle>
          <CardDescription>
            Search for an employee by ID or name to view their job history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by employee ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-red-500 p-8 text-center">
              <AlertCircle className="h-10 w-10 mb-2" />
              <h3 className="text-lg font-semibold">Employee not found</h3>
              <p className="text-sm text-muted-foreground">
                Try a different search term or employee ID
              </p>
            </div>
          ) : employeeData ? (
            <>
              <div className="mb-6 bg-muted p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2">{employeeData.firstname} {employeeData.lastname}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p>{employeeData.empno}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p>{formatDate(employeeData.hiredate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p>{employeeData.sepdate ? `Separated: ${formatDate(employeeData.sepdate)}` : 'Active'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <Button onClick={generatePDF} variant="outline" className="flex items-center gap-1">
                  <FileDown className="h-4 w-4" /> Download PDF
                </Button>
              </div>

              <Table>
                <TableCaption>Job history for {employeeData.firstname} {employeeData.lastname}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeData.jobHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No job history records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    employeeData.jobHistory.map((job, index) => (
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
            </>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p>No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>Search for an employee to view their job history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
