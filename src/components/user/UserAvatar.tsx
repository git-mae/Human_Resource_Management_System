
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  onImageError?: () => void;
}

const UserAvatar = ({ user, size = "md", onImageError }: UserAvatarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  };

  useEffect(() => {
    async function fetchAvatar() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const avatarPath = `${user.id}/avatar`;
        const { data, error } = await supabase
          .storage
          .from('avatars')
          .list(user.id, {
            limit: 1,
            search: 'avatar',
          });

        if (error) {
          console.error('Error fetching avatar list:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Avatar exists, get URL
          const { data: urlData } = await supabase
            .storage
            .from('avatars')
            .getPublicUrl(avatarPath);

          setAvatarUrl(urlData.publicUrl + '?t=' + new Date().getTime());
        }
      } catch (error) {
        console.error('Avatar fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvatar();
  }, [user]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleImageError = () => {
    setAvatarUrl(null);
    if (onImageError) onImageError();
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {avatarUrl && (
        <AvatarImage
          src={avatarUrl}
          alt={`${user?.user_metadata?.name || 'User'}'s avatar`}
          onError={handleImageError}
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {loading ? "..." : getInitials(user?.user_metadata?.name || user?.email)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
