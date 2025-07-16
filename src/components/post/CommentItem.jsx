// src/components/post/CommentItem.jsx
import React, { useState } from 'react';
import { Heart, Reply, MoreHorizontal } from 'lucide-react';

const CommentItem = ({ comment, formatTimestamp, level = 0 }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement comment liking API call
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const submitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    // TODO: Implement reply submission
    console.log('Reply:', replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  const displayUser = {
    name: comment.user || 'Unknown User',
    verified: false
  };

  // Limit nesting level to prevent too deep threading
  const maxLevel = 3;
  const isNested = level > 0;
  const canReply = level < maxLevel;

  return (
    <div className={`${isNested ? 'ml-12 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="p-4">
        <div className="flex space-x-3">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">
              {displayUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 text-sm">
                  {displayUser.name}
                </span>
                {displayUser.verified && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <span className="text-gray-500 text-xs">
                  {formatTimestamp(comment.created_at)}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Comment Text */}
            <div className="mt-1">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-4 mt-2">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>

              {canReply && (
                <button 
                  onClick={handleReply}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <form onSubmit={submitReply} className="mt-3">
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">U</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${displayUser.name}...`}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={2}
                      maxLength={300}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {replyText.length}/300
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowReplyForm(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Nested Replies */}
            {replies.length > 0 && (
              <div className="mt-3">
                {replies.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply}
                    formatTimestamp={formatTimestamp}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;