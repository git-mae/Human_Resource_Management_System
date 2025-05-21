
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EmployeeWithJobs } from '@/types/job-history';
import { format } from 'date-fns';

// Function to format dates
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MM/dd/yyyy');
  } catch {
    return 'Invalid date';
  }
};

// Function to calculate years of service
const calculateYearsOfService = (hiredate: string | null, sepdate: string | null): string => {
  if (!hiredate) return 'N/A';
  
  const startDate = new Date(hiredate);
  const endDate = sepdate ? new Date(sepdate) : new Date();
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  
  return diffYears.toFixed(1) + ' years';
};

// Format currency
const formatCurrency = (amount: number | null): string => {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generatePDF = (employee: EmployeeWithJobs): void => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Job History Report - ${employee.firstname} ${employee.lastname}`,
    author: 'HR System',
    subject: 'Employee Job History',
    keywords: 'job history, employee, report',
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Employee Job History Report`, 14, 22);
  
  // Add employee information
  doc.setFontSize(12);
  doc.text(`Employee: ${employee.firstname} ${employee.lastname}`, 14, 32);
  doc.text(`ID: ${employee.empno}`, 14, 38);
  doc.text(`Hire Date: ${formatDate(employee.hiredate)}`, 14, 44);
  
  const status = employee.sepdate ? `Separated: ${formatDate(employee.sepdate)}` : 'Active';
  doc.text(`Status: ${status}`, 14, 50);
  
  // Add years of service
  doc.text(`Years of Service: ${calculateYearsOfService(employee.hiredate, employee.sepdate)}`, 14, 56);
  
  // Add job history table
  autoTable(doc, {
    head: [['Effective Date', 'Job Title', 'Department', 'Salary']],
    body: employee.jobHistory.map(job => [
      formatDate(job.effdate),
      job.jobdesc || job.jobcode,
      job.deptname || job.deptcode || 'N/A',
      formatCurrency(job.salary),
    ]),
    startY: 65,
  });
  
  // Add footer with datetime
  const date = new Date().toLocaleString();
  // Fix: Use the correct method to get the number of pages
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Report generated on ${date} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  doc.save(`${employee.lastname}_${employee.firstname}_job_history.pdf`);
};
