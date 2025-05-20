
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EmployeeWithJobs } from '@/types/job-history';
import { formatDate } from './date-formatter';

export const generatePDF = (employee: EmployeeWithJobs) => {
  const doc = new jsPDF();
  const employeeName = `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || 'Employee';
  const filename = `${employeeName.replace(/\s+/g, '_')}_job_history.pdf`;
  
  // Add title
  doc.setFontSize(18);
  doc.text('Employee Job History Report', 14, 22);
  
  // Add employee details
  doc.setFontSize(12);
  doc.text(`Employee: ${employeeName}`, 14, 32);
  doc.text(`Employee ID: ${employee.empno}`, 14, 38);
  doc.text(`Hire Date: ${formatDate(employee.hiredate)}`, 14, 44);
  doc.text(`Status: ${employee.sepdate ? `Separated: ${formatDate(employee.sepdate)}` : 'Active'}`, 14, 50);
  
  // Format job history data for table
  const tableData = employee.jobHistory.map(job => [
    formatDate(job.effdate),
    job.jobdesc || job.jobcode,
    job.deptname || job.deptcode || 'N/A',
    job.salary ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(job.salary) : 'N/A'
  ]);
  
  // Add job history table
  autoTable(doc, {
    head: [['Effective Date', 'Job', 'Department', 'Salary']],
    body: tableData,
    startY: 60,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add footer with datetime
  const date = new Date().toLocaleString();
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Generated on: ${date} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(filename);
};
