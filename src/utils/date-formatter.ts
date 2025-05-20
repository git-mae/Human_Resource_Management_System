
import { format } from 'date-fns';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'PP');
  } catch (error) {
    return 'Invalid date';
  }
};
