import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { UserAvatar, VerificationBadge } from '../ui';

const PostHeader = ({ user, timestamp, onMenuClick }) => {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center min-w-0">
        <UserAvatar user={user} />
        <div className="ml-3 min-w-0">
          <div className="flex items-center">
            <span className="font-semibold text-gray-900 truncate">{user.name}</span>
            {user.verified && <VerificationBadge />}
          </div>
          <span className="text-gray-500 text-sm">{timestamp}</span>
        </div>
      </div>
      <button 
        onClick={onMenuClick}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PostHeader;