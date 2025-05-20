
export type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  jobdesc: string | null;
  deptname: string | null;
  firstname: string | null;
  lastname: string | null;
};

export type EmployeeWithJobs = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  gender: string | null;
  birthdate: string | null;
  hiredate: string | null;
  sepdate: string | null;
  jobHistory: JobHistory[];
};
