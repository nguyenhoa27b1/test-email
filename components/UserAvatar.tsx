
import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getColor = (userId: string): string => {
  if (!userId) return colors[0];
  // Simple hash to get a consistent color
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, userId, size = 'lg', className = '' }) => {
  const [imgError, setImgError] = React.useState(false);
  const showImage = avatarUrl && !imgError;

  if (showImage) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        title={name}
        onError={() => setImgError(true)}
      />
    );
  }

  const initials = getInitials(name);
  const color = getColor(userId);

  return (
    <div
      title={name}
      className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
