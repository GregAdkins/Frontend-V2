import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../../services/api';

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

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

  const handleComment = () => {
    navigate(`/post/${post.slug}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.slug}`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const displayUser = {
    name: post.author || 'Unknown User',
    verified: false,
    username: post.author || 'unknown'
  };

  // SMART CONTENT TYPE DETECTION - Frontend fallback
  const getActualContentType = () => {
    // If backend says it's video but has no video_url, it's probably an image
    if (post.content_type === 'video' && !post.video_url && (post.image_url || post.image)) {
      console.log(`Post ${post.id}: Backend says 'video' but no video_url found, treating as image`);
      return 'image';
    }
    
    // If backend says it's video and has video_url, it's actually video
    if (post.content_type === 'video' && post.video_url) {
      return 'video';
    }
    
    // If it has image but content_type is wrong, detect as image
    if ((post.image_url || post.image) && !post.video_url) {
      return 'image';
    }
    
    // Default to backend content_type
    return post.content_type;
  };

  const actualContentType = getActualContentType();

  // Function to determine if this is actually a video post
  const isVideoPost = () => {
    return actualContentType === 'video' && post.video_url;
  };

  // Function to determine if this is an image post
  const isImagePost = () => {
    return actualContentType === 'image' && (post.image_url || post.image);
  };

  const renderMedia = () => {
    console.log('PostCard Debug:', {
      id: post.id,
      backend_content_type: post.content_type,
      actual_content_type: actualContentType,
      has_video_url: !!post.video_url,
      has_image_url: !!post.image_url,
      has_image: !!post.image,
      isVideoPost: isVideoPost(),
      isImagePost: isImagePost()
    });

    // ONLY show video interface if it's actually a video post with video_url
    if (isVideoPost()) {
      return (
        <div className="mb-4">
          {showVideoPlayer ? (
            // Show actual video player
            <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                poster={post.video_thumbnail_url || post.image_url}
                onError={(e) => {
                  console.error('Video failed to load:', post.video_url);
                }}
              >
                <source src={post.video_url} type="video/mp4" />
                <source src={post.video_url} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            // Show video thumbnail with play button
            <div 
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setShowVideoPlayer(true)}
            >
              <img 
                src={post.video_thumbnail_url || post.image_url || '/api/placeholder/600/400'}
                alt="Video thumbnail"
                className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/api/placeholder/600/400';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 group-hover:scale-110 transition-all">
                  <Play className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                VIDEO
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Show regular image for image posts or posts with images
    if (isImagePost()) {
      return (
        <div className="mb-4">
          <div 
            className="rounded-lg overflow-hidden cursor-pointer" 
            onClick={handlePostClick}
          >
            <img 
              src={post.image_url || post.image}
              alt={post.title || 'Post image'}
              className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = '/api/placeholder/600/400';
              }}
            />
          </div>
        </div>
      );
    }

    // No media to show
    return null;
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
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">{formatTimestamp(post.created_at)}</span>
              {actualContentType !== 'post' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-medium">
                  {actualContentType}
                  {actualContentType !== post.content_type && (
                    <span className="ml-1 text-red-500" title={`Backend says: ${post.content_type}`}>*</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => console.log('Menu clicked for post:', post.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="p-4">
        {post.title && (
          <h3 
            onClick={handlePostClick}
            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {post.title}
          </h3>
        )}
        
        {post.content && (
          <div 
            onClick={handlePostClick}
            className="cursor-pointer"
          >
            <p className="text-gray-800 mb-4 leading-relaxed">
              {post.content.length > 200 ? (
                <>
                  {post.content.substring(0, 200)}...
                  <span className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                    Read more
                  </span>
                </>
              ) : (
                post.content
              )}
            </p>
          </div>
        )}
        
        {/* Media Content */}
        {renderMedia()}

        {/* Tags */}
        {post.tags_list && post.tags_list.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags_list.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-100"
              >
                #{tag}
              </span>
            ))}
            {post.tags_list.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags_list.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className={`flex items-center transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount > 0 && <span className="text-sm">{likesCount}</span>}
          </button>
          
          <button 
            onClick={handleComment}
            className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {post.comments_count > 0 && <span className="text-sm">{post.comments_count}</span>}
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center text-gray-500 hover:text-green-500 transition-colors"
          >
            <Share className="w-5 h-5 mr-1" />
            {sharesCount > 0 && <span className="text-sm">{sharesCount}</span>}
          </button>
        </div>
        
        <button 
          onClick={handleBookmark}
          className={`flex items-center transition-colors ${
            isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;