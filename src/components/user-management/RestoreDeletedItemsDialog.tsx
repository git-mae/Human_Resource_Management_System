
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDate } from '@/utils/date-formatter';

interface RestoreDeletedItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeletedItem {
  id: string;
  table_name: string;
  deleted_at: string;
  item_id: string;
  item_data: any;
  restored: boolean;
}

const RestoreDeletedItemsDialog = ({ open, onOpenChange }: RestoreDeletedItemsDialogProps) => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('employee');
  
  useEffect(() => {
    if (open) {
      fetchDeletedItems();
    }
  }, [open, currentTab]);

  const fetchDeletedItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deleted_items')
        .select('*')
        .eq('table_name', currentTab)
        .order('deleted_at', { ascending: false });
        
      if (error) throw error;
      
      setDeletedItems(data || []);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error('Failed to load deleted items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item: DeletedItem) => {
    try {
      // Insert the item back into its original table
      const { error: insertError } = await supabase
        .from(item.table_name)
        .insert(item.item_data);
        
      if (insertError) throw insertError;
      
      // Update the deleted_items record to mark as restored
      const { error: updateError } = await supabase
        .from('deleted_items')
        .update({ restored: true })
        .eq('id', item.id);
        
      if (updateError) throw updateError;
      
      // Create notification about restoration
      await supabase.from('notifications').insert({
        message: `A ${item.table_name} record has been restored by an administrator`,
        type: 'info',
        is_global: true,
        is_read: false
      });
      
      toast.success(`Item restored successfully`);
      
      // Update local state
      setDeletedItems(items => 
        items.map(i => i.id === item.id ? { ...i, restored: true } : i)
      );
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Restore Deleted Items</DialogTitle>
          <DialogDescription>
            View and restore items that have been deleted from the system
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="employee">Employees</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="department">Departments</TabsTrigger>
            <TabsTrigger value="jobhistory">Job History</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border-b">
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))
            ) : deletedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deleted {currentTab} records found
              </div>
            ) : (
              <div className="space-y-3">
                {deletedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <h4 className="font-semibold">
                        {currentTab === 'employee' && item.item_data.firstname && item.item_data.lastname ? 
                          `${item.item_data.firstname} ${item.item_data.lastname}` : 
                          currentTab === 'job' && item.item_data.jobdesc ? 
                          item.item_data.jobdesc : 
                          currentTab === 'department' && item.item_data.deptname ? 
                          item.item_data.deptname : 
                          `${currentTab} #${item.item_id}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Deleted: {formatDate(item.deleted_at)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRestore(item)}
                      disabled={item.restored}
                      variant={item.restored ? "outline" : "default"}
                    >
                      {item.restored ? "Restored" : "Restore"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RestoreDeletedItemsDialog;
