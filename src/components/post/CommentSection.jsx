import React, { useState, useEffect } from 'react';
import { Send, Loader, AlertCircle, MessageCircle } from 'lucide-react';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CommentItem from './CommentItem';

const CommentSection = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async (pageNum = 1, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
      }
      setError('');
      
      const response = await postsAPI.getComments(postId, pageNum);
      const newComments = response.results || response || [];
      
      if (reset) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }
      
      // Check if there are more comments to load
      setHasMore(response.next ? true : false);
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const commentData = {
        text: newComment.trim()
      };
      
      const response = await postsAPI.createComment(postId, commentData);
      
      // Add new comment to the beginning of the list
      setComments(prev => [response, ...prev]);
      setNewComment('');
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
      
    } catch (error) {
      console.error('Error creating comment:', error);
      
      let errorMessage = 'Failed to post comment. Please try again.';
      if (error.response?.data?.text) {
        errorMessage = error.response.data.text[0];
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Comments Header */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading comments...</p>
          </div>
        ) : error && comments.length === 0 ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchComments()}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No comments yet</p>
            <p className="text-gray-500 text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment}
                formatTimestamp={formatTimestamp}
              />
            ))}
            
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMoreComments}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Load more comments
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;