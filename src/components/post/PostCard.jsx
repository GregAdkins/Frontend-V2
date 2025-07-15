import React, { useState } from 'react';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked for post:', post.id);
  };

  const handleComment = () => {
    console.log('Comment clicked for post:', post.id);
  };

  const handleShare = () => {
    console.log('Share clicked for post:', post.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 hover:shadow-md transition-shadow">
      <PostHeader 
        user={post.user}
        timestamp={post.timestamp}
        onMenuClick={handleMenuClick}
      />
      
      <PostContent 
        text={post.content}
        media={post.media}
        caption={post.caption}
      />
      
      <PostActions
        likes={likesCount}
        comments={post.comments}
        shares={post.shares}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
      />
    </div>
  );
};

export default PostCard;