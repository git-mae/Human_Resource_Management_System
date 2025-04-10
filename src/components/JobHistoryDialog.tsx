
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
};

type JobHistoryFormData = {
  empno: string;
  jobcode: string;
  deptcode: string;
  effdate: string;
  salary: string;
};

type Employee = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
};

type Job = {
  jobcode: string;
  jobdesc: string | null;
};

type Department = {
  deptcode: string;
  deptname: string | null;
};

interface JobHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const JobHistoryDialog = ({ isOpen, onClose, employee }: JobHistoryDialogProps) => {
  // Debug logs to help troubleshoot
  console.log("JobHistoryDialog - isOpen:", isOpen);
  console.log("JobHistoryDialog - employee:", employee);

  const [addJobDialogOpen, setAddJobDialogOpen] = useState(false);
  const [editJobDialogOpen, setEditJobDialogOpen] = useState(false);
  const [deleteJobDialogOpen, setDeleteJobDialogOpen] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistory | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch job history for the employee
  const { data: jobHistories, isLoading: isLoadingJobHistory } = useQuery({
    queryKey: ['jobHistories', employee?.empno],
    queryFn: async () => {
      if (!employee?.empno) return [];
      
      console.log("Fetching job histories for employee:", employee.empno);
      
      const { data, error } = await supabase
        .from('jobhistory')
        .select(`
          *,
          job:jobcode (jobdesc),
          department:deptcode (deptname)
        `)
        .eq('empno', employee.empno)
        .order('effdate', { ascending: false });
      
      if (error) {
        console.error("Error fetching job histories:", error);
        throw new Error(error.message);
      }
      
      console.log("Job histories fetched:", data);
      return data;
    },
    enabled: !!employee?.empno && isOpen
  });

  // Fetch jobs for dropdown
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log("Fetching jobs for dropdown");
      
      const { data, error } = await supabase
        .from('job')
        .select('*')
        .order('jobcode');
      
      if (error) {
        console.error("Error fetching jobs:", error);
        throw new Error(error.message);
      }
      
      console.log("Jobs fetched:", data);
      return data as Job[];
    },
    enabled: isOpen
  });

  // Fetch departments for dropdown
  const { data: departments, isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      console.log("Fetching departments for dropdown");
      
      const { data, error } = await supabase
        .from('department')
        .select('*')
        .order('deptcode');
      
      if (error) {
        console.error("Error fetching departments:", error);
        throw new Error(error.message);
      }
      
      console.log("Departments fetched:", data);
      return data as Department[];
    },
    enabled: isOpen
  });

  // Form for adding job history
  const addJobForm = useForm<JobHistoryFormData>({
    defaultValues: {
      empno: employee?.empno || '',
      jobcode: '',
      deptcode: '',
      effdate: new Date().toISOString().split('T')[0],
      salary: '',
    }
  });

  // Form for editing job history
  const editJobForm = useForm<JobHistoryFormData>({
    defaultValues: {
      empno: '',
      jobcode: '',
      deptcode: '',
      effdate: '',
      salary: '',
    }
  });

  // Update forms when employee changes
  useEffect(() => {
    if (employee) {
      console.log("Setting employee in form:", employee.empno);
      addJobForm.setValue('empno', employee.empno);
    }
  }, [employee, addJobForm]);

  // Add job history mutation
  const addJobHistoryMutation = useMutation({
    mutationFn: async (newJobHistory: JobHistoryFormData) => {
      const { data, error } = await supabase
        .from('jobhistory')
        .insert({
          empno: newJobHistory.empno,
          jobcode: newJobHistory.jobcode,
          deptcode: newJobHistory.deptcode,
          effdate: newJobHistory.effdate,
          salary: parseFloat(newJobHistory.salary) || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobHistories', employee?.empno] });
      setAddJobDialogOpen(false);
      toast.success("Job history added successfully");
    },
    onError: (error) => {
      console.error("Error adding job history:", error);
      toast.error(`Failed to add job history: ${error.message}`);
    }
  });

  // Update job history mutation
  const updateJobHistoryMutation = useMutation({
    mutationFn: async (updatedJobHistory: JobHistoryFormData) => {
      const { data, error } = await supabase
        .from('jobhistory')
        .update({
          jobcode: updatedJobHistory.jobcode,
          deptcode: updatedJobHistory.deptcode,
          effdate: updatedJobHistory.effdate,
          salary: parseFloat(updatedJobHistory.salary) || null
        })
        .eq('empno', updatedJobHistory.empno)
        .eq('jobcode', currentJobHistory?.jobcode || '')
        .eq('effdate', currentJobHistory?.effdate || '')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobHistories', employee?.empno] });
      setEditJobDialogOpen(false);
      setCurrentJobHistory(null);
      toast.success("Job history updated successfully");
    },
    onError: (error) => {
      console.error("Error updating job history:", error);
      toast.error(`Failed to update job history: ${error.message}`);
    }
  });

  // Delete job history mutation
  const deleteJobHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!currentJobHistory) throw new Error("No job history selected");
      
      const { error } = await supabase
        .from('jobhistory')
        .delete()
        .eq('empno', currentJobHistory.empno)
        .eq('jobcode', currentJobHistory.jobcode)
        .eq('effdate', currentJobHistory.effdate);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobHistories', employee?.empno] });
      setDeleteJobDialogOpen(false);
      setCurrentJobHistory(null);
      toast.success("Job history deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting job history:", error);
      toast.error(`Failed to delete job history: ${error.message}`);
    }
  });

  // Handle opening the edit modal
  const handleEditJob = (jobHistory: JobHistory) => {
    setCurrentJobHistory(jobHistory);
    editJobForm.reset({
      empno: jobHistory.empno,
      jobcode: jobHistory.jobcode,
      deptcode: jobHistory.deptcode || '',
      effdate: jobHistory.effdate,
      salary: jobHistory.salary ? jobHistory.salary.toString() : '',
    });
    setEditJobDialogOpen(true);
  };

  // Handle opening the delete confirmation
  const handleDeleteConfirmation = (jobHistory: JobHistory) => {
    setCurrentJobHistory(jobHistory);
    setDeleteJobDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd-MMM-yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Job History</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Employee Number:</span>
                <h3 className="font-semibold">{employee?.empno}</h3>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Employee Name:</span>
                <h3 className="font-semibold">
                  {employee?.lastname}, {employee?.firstname}
                </h3>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  addJobForm.reset({
                    empno: employee?.empno || '',
                    jobcode: '',
                    deptcode: '',
                    effdate: new Date().toISOString().split('T')[0],
                    salary: '',
                  });
                  setAddJobDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Job
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Description</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingJobHistory ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : jobHistories?.length ? (
                  jobHistories.map((jobHistory) => (
                    <TableRow key={`${jobHistory.empno}-${jobHistory.jobcode}-${jobHistory.effdate}`}>
                      <TableCell>{jobHistory.job?.jobdesc || jobHistory.jobcode}</TableCell>
                      <TableCell>{formatDate(jobHistory.effdate)}</TableCell>
                      <TableCell>{jobHistory.department?.deptname || jobHistory.deptcode || '-'}</TableCell>
                      <TableCell>{jobHistory.salary ? `$${jobHistory.salary.toLocaleString()}` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditJob(jobHistory)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDeleteConfirmation(jobHistory)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No job history records found for this employee.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Job Dialog */}
      <Dialog open={addJobDialogOpen} onOpenChange={setAddJobDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Job History</DialogTitle>
          </DialogHeader>
          <Form {...addJobForm}>
            <form onSubmit={addJobForm.handleSubmit((data) => {
              addJobHistoryMutation.mutate(data);
            })} className="space-y-4">
              <FormField
                control={addJobForm.control}
                name="jobcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        required
                      >
                        <option value="">Select a job</option>
                        {jobs?.map(job => (
                          <option key={job.jobcode} value={job.jobcode}>
                            {job.jobdesc || job.jobcode}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addJobForm.control}
                name="deptcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        required
                      >
                        <option value="">Select a department</option>
                        {departments?.map(dept => (
                          <option key={dept.deptcode} value={dept.deptcode}>
                            {dept.deptname || dept.deptcode}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addJobForm.control}
                name="effdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addJobForm.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddJobDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addJobHistoryMutation.isPending}>
                  {addJobHistoryMutation.isPending ? "Saving..." : "Save Job"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={editJobDialogOpen} onOpenChange={setEditJobDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job History</DialogTitle>
          </DialogHeader>
          <Form {...editJobForm}>
            <form onSubmit={editJobForm.handleSubmit((data) => {
              updateJobHistoryMutation.mutate(data);
            })} className="space-y-4">
              <FormField
                control={editJobForm.control}
                name="jobcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        required
                        disabled
                      >
                        <option value="">Select a job</option>
                        {jobs?.map(job => (
                          <option key={job.jobcode} value={job.jobcode}>
                            {job.jobdesc || job.jobcode}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editJobForm.control}
                name="deptcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        required
                      >
                        <option value="">Select a department</option>
                        {departments?.map(dept => (
                          <option key={dept.deptcode} value={dept.deptcode}>
                            {dept.deptname || dept.deptcode}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editJobForm.control}
                name="effdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" required disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editJobForm.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateJobHistoryMutation.isPending}>
                  {updateJobHistoryMutation.isPending ? "Saving..." : "Update Job"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteJobDialogOpen} onOpenChange={setDeleteJobDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job history
              record for this employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                deleteJobHistoryMutation.mutate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteJobHistoryMutation.isPending}
            >
              {deleteJobHistoryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JobHistoryDialog;
