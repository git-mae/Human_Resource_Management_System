
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`recipient_id.eq.${user.id},is_global.eq.true`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        setNotifications(data as Notification[]);
        setHasUnread(data.some(n => !n.is_read));
      } catch (err) {
        console.error('Error in notifications fetch:', err);
      }
    };

    fetchNotifications();

    // Subscribe to realtime updates for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 9)]);
          setHasUnread(true);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Mark all notifications as read in the database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`recipient_id.eq.${user.id},is_global.eq.true`)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
        return;
      }
      
      // Update local state
      setNotifications(currentNotifications => 
        currentNotifications.map(n => ({ ...n, is_read: true }))
      );
      setHasUnread(false);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleOpen = (open: boolean) => {
    if (open && hasUnread) {
      markAllAsRead();
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error("Failed to delete notification");
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(currentNotifications => 
        currentNotifications.filter(n => n.id !== id)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title="Notifications">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Notifications</h3>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-2 p-3">
                  <div className={`flex-1 ${!notification.is_read ? 'font-medium' : ''}`}>
                    <p className="line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteNotification(notification.id)}
                      className="opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
