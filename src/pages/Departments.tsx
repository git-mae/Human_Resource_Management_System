
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments, useDepartmentEmployeeCounts, useDepartmentEmployees } from '@/hooks/useDepartments';
import DepartmentTable from '@/components/departments/DepartmentTable';
import EmployeeList from '@/components/departments/EmployeeList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Departments = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    data: departments, 
    isLoading: loadingDepts, 
    error: deptsError 
  } = useDepartments();

  const { 
    data: employeeCounts, 
    isLoading: loadingCounts 
  } = useDepartmentEmployeeCounts();

  const { 
    data: departmentEmployees, 
    isLoading: loadingEmployees 
  } = useDepartmentEmployees(selectedDepartment);

  if (deptsError) {
    console.error('Error loading departments:', deptsError);
  }

  const handleDepartmentClick = (deptCode: string) => {
    setSelectedDepartment(deptCode === selectedDepartment ? null : deptCode);
  };

  const selectedDepartmentData = departments?.find(d => d.deptcode === selectedDepartment);

  // Filter departments based on search query
  const filteredDepartments = departments?.filter(dept => {
    const deptCode = dept.deptcode.toLowerCase();
    const deptName = dept.deptname?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return deptCode.includes(query) || deptName.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Department List</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DepartmentTable 
            departments={filteredDepartments}
            employeeCounts={employeeCounts}
            selectedDepartment={selectedDepartment}
            isLoading={loadingDepts || loadingCounts}
            onDepartmentClick={handleDepartmentClick}
          />
          
          {selectedDepartment && (
            <EmployeeList 
              employees={departmentEmployees}
              department={selectedDepartmentData}
              isLoading={loadingEmployees}
              departmentCode={selectedDepartment}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;
