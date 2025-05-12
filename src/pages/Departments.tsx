
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartments, useDepartmentEmployeeCounts, useDepartmentEmployees } from '@/hooks/useDepartments';
import DepartmentTable from '@/components/departments/DepartmentTable';
import EmployeeList from '@/components/departments/EmployeeList';

const Departments = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentTable 
            departments={departments}
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
