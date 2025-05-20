
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { EmployeeSearchForm } from '@/components/reports/EmployeeSearchForm';
import { EmployeeInfoCard } from '@/components/reports/EmployeeInfoCard';
import { JobHistoryTable } from '@/components/reports/JobHistoryTable';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { generatePDF } from '@/utils/pdf-generator';
import { usePermissions } from '@/services/UserPermissionsService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatDate } from '@/utils/date-formatter';

const JobHistoryReport = () => {
  const { 
    searchQuery,
    setSearchQuery,
    employeeData,
    isLoading,
    error,
    refetch
  } = useEmployeeSearch();

  const { canEditJobHistory } = usePermissions();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleDownloadPDF = () => {
    if (employeeData) {
      generatePDF(employeeData);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Employee Job History Report</h2>
          {employeeData && (
            <Button onClick={handleDownloadPDF} variant="outline" className="flex gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Search for Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeSearchForm 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              isLoading={isLoading}
            />
            
            {error && (
              <p className="text-destructive mt-4">
                Error: {(error as Error).message}
              </p>
            )}
            
            {employeeData && (
              <div className="mt-4">
                <EmployeeInfoCard employee={employeeData} />
                <JobHistoryTable 
                  jobHistory={employeeData.jobHistory} 
                  employeeName={`${employeeData.firstname || ''} ${employeeData.lastname || ''}`}
                />
              </div>
            )}
            
            {!isLoading && !employeeData && searchQuery && (
              <p className="text-center py-4">
                No employee found matching "{searchQuery}"
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default JobHistoryReport;
