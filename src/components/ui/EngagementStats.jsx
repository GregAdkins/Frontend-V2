import React from 'react';

const EngagementStats = ({ likes, comments, shares }) => {
  return (
    <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100">
      {likes > 0 && <span>{likes} likes</span>}
      {comments > 0 && <span className="ml-3">{comments} comments</span>}
      {shares > 0 && <span className="ml-3">{shares} shares</span>}
    </div>
  );
};

export default EngagementStats;