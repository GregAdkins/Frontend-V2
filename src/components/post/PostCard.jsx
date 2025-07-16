import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { postsAPI } from '../../services/api';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);

  const handleLike = async () => {
    try {
      await postsAPI.likePost(post.id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    try {
      await postsAPI.sharePost(post.id);
      setSharesCount(prev => prev + 1);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
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

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  // Create user object for display
  const displayUser = {
    name: post.author || 'Unknown User',
    verified: false // Django backend doesn't have verified field
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center min-w-0">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {displayUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-3 min-w-0">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 truncate">{displayUser.name}</span>
              {displayUser.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ml-1 flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="text-gray-500 text-sm">{formatTimestamp(post.created_at)}</span>
          </div>
        </div>
        <button 
          onClick={handleMenuClick}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="p-4">
        {post.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        )}
        
        {post.content && (
          <p className="text-gray-800 mb-4 leading-relaxed">
            {post.content}
          </p>
        )}
        
        {post.image && (
          <div className="mb-4">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title || 'Post image'}
                className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className={`flex items-center transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-5 h-5 mr-1" />
            {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
          </button>
          
          <button 
            onClick={handleComment}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {post.comments_count > 0 && <span className="text-sm">{post.comments_count}</span>}
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Share className="w-5 h-5 mr-1" />
            {sharesCount > 0 && <span className="text-sm">{sharesCount}</span>}
          </button>
        </div>
        
        <button 
          onClick={handleBookmark}
          className={`flex items-center transition-colors ${
            isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;