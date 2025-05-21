
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, FileText, Download } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEmployeeSearch } from '@/hooks/useEmployeeSearch';
import { generatePDF } from '@/utils/pdf-generator';

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
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          {employeeData && (
            <Button onClick={handleDownloadPDF} variant="outline" className="flex gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Job History Report</CardTitle>
              <CardDescription>
                View the job history for specific employees
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Link to="/reports/job-history">
                <Button className="flex gap-2">
                  <FileText className="h-4 w-4" />
                  View Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Reports;
