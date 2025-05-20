
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import UserAvatar from './UserAvatar';

interface AvatarUploadProps {
  user: User | null;
  onAvatarUpdated?: () => void;
}

const AvatarUpload = ({ user, onAvatarUpdated }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Used to force re-render of avatar

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0 || !user) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar`;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload a JPEG, PNG, GIF, or WebP image.');
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      toast.success('Avatar updated successfully');
      
      // Force avatar component to re-fetch
      setAvatarKey(prev => prev + 1);
      if (onAvatarUpdated) {
        onAvatarUpdated();
      }

    } catch (error: any) {
      toast.error(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
      // Clear the input value to allow uploading the same file again
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div key={avatarKey}>
        <UserAvatar user={user} size="lg" />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="relative overflow-hidden"
          disabled={uploading || !user}
        >
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading || !user}
          />
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarUpload;
