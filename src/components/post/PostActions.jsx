import React from 'react';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { IconButton } from '../ui';

const PostActions = ({ likes, comments, shares, isLiked, isBookmarked, onLike, onComment, onShare, onBookmark }) => {
  return (
    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <IconButton
          icon={Heart}
          count={likes}
          isActive={isLiked}
          onClick={onLike}
          activeColor="text-red-500"
        />
        <IconButton
          icon={MessageCircle}
          count={comments}
          onClick={onComment}
          activeColor="text-blue-500"
        />
        <IconButton
          icon={Share}
          count={shares}
          onClick={onShare}
          activeColor="text-green-500"
        />
      </div>
      <IconButton
        icon={Bookmark}
        isActive={isBookmarked}
        onClick={onBookmark}
        activeColor="text-yellow-500"
      />
    </div>
  );
};

export default PostActions;