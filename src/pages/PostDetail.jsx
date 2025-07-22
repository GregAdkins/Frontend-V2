import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Loader, AlertCircle, Play } from 'lucide-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/post/CommentSection';

// Simple Video Player Component (inline to avoid import issues)
const VideoPlayer = ({ src, poster, className = '', controls = true, autoplay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No video source provided</p>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <video
        className="w-full h-full object-cover rounded-lg"
        poster={poster}
        controls={controls}
        autoPlay={autoplay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        onLoadStart={() => setHasError(false)}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {hasError && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm">Unable to load video</p>
            <button 
              onClick={() => {
                setHasError(false);
                // Try to reload the video
                const video = document.querySelector('video');
                if (video) video.load();
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await postsAPI.getPost(slug);
      setPost(response);
      setLikesCount(response.likes_count || 0);
      setSharesCount(response.shares_count || 0);
      setCommentsCount(response.comments_count || 0);
      setIsLiked(response.is_liked || false);
      setIsBookmarked(response.is_bookmarked || false);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
      
      // Copy link to clipboard
      const postUrl = window.location.href;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        alert('Post link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      await postsAPI.bookmarkPost(post.id);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post) return null;

    // Check if post has video
    if (post.video_url || post.content_type === 'video') {
      return (
        <div className="mb-6">
          <VideoPlayer
            src={post.video_url}
            poster={post.video_thumbnail_url || post.image_url}
            className="w-full max-h-96 rounded-lg overflow-hidden"
            controls={true}
            autoplay={false}
          />
          {post.title && (
            <p className="text-sm text-gray-600 mt-2 text-center">{post.title}</p>
          )}
        </div>
      );
    }
    
    // Check if post has image
    if (post.image_url || post.image) {
      return (
        <div className="mb-6">
          <img 
            src={post.image_url || post.image}
            alt={post.title || 'Post image'}
            className="w-full max-h-96 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/api/placeholder/800/600';
            }}
          />
        </div>
      );
    }

    return null;
  };

  const renderWorkflowSteps = () => {
    if (post.content_type !== 'workflow' || !post.workflow_steps_parsed) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>
        <div className="space-y-4">
          {post.workflow_steps_parsed.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  {step.duration && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      Duration: {step.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const displayUser = {
    name: post.author || 'Unknown User',
    verified: false,
    username: post.author || 'unknown'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Post Detail Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {displayUser.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-900">{displayUser.username}</h3>
                  {displayUser.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500 text-sm">{formatTimestamp(post.created_at)}</p>
                  {post.content_type !== 'post' && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-medium">
                      {post.content_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6">
          {post.title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          )}
          
          {post.content && (
            <div className="prose max-w-none mb-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          )}
          
          {/* Media Content */}
          {renderMedia()}

          {/* Workflow Steps */}
          {renderWorkflowSteps()}

          {/* Tags */}
          {post.tags_list && post.tags_list.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags_list.map((tag, index) => (
                <span 
                  key={index}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Location */}
          {post.location && (
            <p className="text-gray-500 text-sm mb-4">📍 {post.location}</p>
          )}
        </div>

        {/* Post Actions */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{likesCount}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">{commentsCount}</span>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Share className="w-6 h-6" />
                <span className="font-medium">{sharesCount}</span>
              </button>
            </div>
            
            <button 
              onClick={handleBookmark}
              className={`transition-colors ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection 
        postId={post.id} 
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default PostDetail;