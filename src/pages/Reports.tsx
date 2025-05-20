
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const Reports = () => {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Job History Report</CardTitle>
              <CardDescription>
                View the job history for specific employees
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Link to="/reports/job-history">
                <Button>
                  View Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Job History Overview</CardTitle>
              <CardDescription>
                View all job history records
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Link to="/job-history">
                <Button>
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
