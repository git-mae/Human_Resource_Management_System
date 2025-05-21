
export interface Notification {
  id: string;
  message: string;
  recipient_id: string | null;
  is_global: boolean;
  is_read: boolean;
  created_at: string;
  type: 'info' | 'warning' | 'error' | 'success';
}
