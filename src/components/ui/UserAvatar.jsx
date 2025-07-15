import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center`}>
      <span className="text-white font-bold">
        {user.name.split(' ').map(n => n[0]).join('')}
      </span>
    </div>
  );
};

export default UserAvatar;