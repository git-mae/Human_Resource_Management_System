
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { generatePDF } from '@/utils/pdf-generator';
import { EmployeeSearchForm } from '@/components/reports/EmployeeSearchForm';
import { EmployeeInfoCard } from '@/components/reports/EmployeeInfoCard';
import { JobHistoryTable } from '@/components/reports/JobHistoryTable';

const Reports = () => {
  const { 
    searchQuery,
    setSearchQuery,
    employeeData,
    isLoading,
    error,
    refetch
  } = useEmployeeSearch();

  const handleSearch = (e: React.FormEvent) => {
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
        
        <div className="bg-white rounded-lg shadow p-6">
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Reports;
