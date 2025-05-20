
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, AlertCircle, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { generateJobHistoryPDF } from '@/utils/pdf-generator';
import { EmployeeSearchForm } from '@/components/reports/EmployeeSearchForm';
import { EmployeeInfoCard } from '@/components/reports/EmployeeInfoCard';
import { JobHistoryTable } from '@/components/reports/JobHistoryTable';

const Reports = () => {
  const { searchQuery, setSearchQuery, employeeData, isLoading, error, refetch } = useEmployeeSearch();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleDownloadPDF = () => {
    if (employeeData) {
      generateJobHistoryPDF(employeeData);
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
          <EmployeeSearchForm 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />

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
              <EmployeeInfoCard employee={employeeData} />

              <div className="flex justify-end mb-2">
                <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-1">
                  <FileDown className="h-4 w-4" /> Download PDF
                </Button>
              </div>

              <JobHistoryTable 
                jobHistory={employeeData.jobHistory} 
                employeeName={`${employeeData.firstname} ${employeeData.lastname}`}
              />
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
