
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EmployeeWithJobs } from '@/types/job-history';

// Extend jsPDF with autoTable method for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateJobHistoryPDF = (employeeData: EmployeeWithJobs) => {
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

    // Now TypeScript recognizes autoTable as a valid method
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
