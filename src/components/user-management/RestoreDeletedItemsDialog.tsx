
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/utils/date-formatter';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RestoreDeletedItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define valid table names type
type ValidTableName = 'department' | 'employee' | 'job' | 'jobhistory';

interface DeletedItem {
  id: string;
  table_name: ValidTableName;
  item_id: string;
  item_data: Record<string, any>;
  deleted_at: string;
  deleted_by: string;
  restored: boolean;
}

const RestoreDeletedItemsDialog = ({ open, onOpenChange }: RestoreDeletedItemsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    if (open && isAdmin) {
      loadDeletedItems();
    }
  }, [open, isAdmin]);

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deleted_items')
        .select('*')
        .eq('restored', false)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setItems(data as DeletedItem[]);
    } catch (error) {
      console.error('Error loading deleted items:', error);
      toast.error('Failed to load deleted items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const itemsToRestore = Object.entries(selectedItems)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
    
    if (itemsToRestore.length === 0) {
      toast.warning('No items selected for restoration');
      return;
    }
    
    setLoading(true);
    
    try {
      // Process each selected item for restoration
      for (const itemId of itemsToRestore) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;
        
        // Insert the item data back into its original table
        const { error: insertError } = await supabase
          .from(item.table_name as ValidTableName)
          .insert(item.item_data);
        
        if (insertError) {
          console.error(`Error restoring item to ${item.table_name}:`, insertError);
          toast.error(`Failed to restore item from ${item.table_name}: ${insertError.message}`);
          continue;
        }
        
        // Mark the item as restored
        const { error: updateError } = await supabase
          .from('deleted_items')
          .update({ restored: true })
          .eq('id', item.id);
          
        if (updateError) {
          console.error('Error updating restoration status:', updateError);
        }
        
        // Create notification
        await supabase.from('notifications').insert({
          message: `${item.table_name} record (${item.item_id}) has been restored`,
          type: 'success',
          is_global: true,
          is_read: false
        });
      }
      
      toast.success('Selected items restored successfully');
      loadDeletedItems(); // Reload list after restoration
      setSelectedItems({});
    } catch (error) {
      console.error('Error in restoration process:', error);
      toast.error('An error occurred during restoration');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAll = (select: boolean) => {
    const newSelection = { ...selectedItems };
    items.forEach(item => {
      newSelection[item.id] = select;
    });
    setSelectedItems(newSelection);
  };
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems({
      ...selectedItems,
      [itemId]: !selectedItems[itemId]
    });
  };
  
  const getSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };
  
  const formatTableName = (tableName: string) => {
    return tableName.charAt(0).toUpperCase() + tableName.slice(1);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Restore Deleted Items</DialogTitle>
          <DialogDescription>
            Select items to restore from the deleted items history. Only items that have not been restored are shown.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(true)}
              disabled={items.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(false)}
              disabled={getSelectedCount() === 0}
            >
              Deselect All
            </Button>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleRestore}
            disabled={getSelectedCount() === 0 || loading}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" /> 
            Restore Selected ({getSelectedCount()})
          </Button>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center p-4">
              No deleted items found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Item ID</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems[item.id] || false}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell>{formatTableName(item.table_name)}</TableCell>
                    <TableCell>{item.item_id}</TableCell>
                    <TableCell>{formatDate(item.deleted_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Show details in a toast for now
                          // Could improve this with a more detailed view
                          const details = Object.entries(item.item_data)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n');
                          toast.info(
                            <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap text-xs">
                              {details}
                            </pre>,
                            {
                              duration: 10000,
                              position: 'bottom-center',
                            }
                          );
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestoreDeletedItemsDialog;
