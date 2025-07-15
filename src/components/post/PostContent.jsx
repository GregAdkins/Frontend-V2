import React from 'react';
import PostImage from './PostImage';

const PostContent = ({ text, media, caption }) => {
  return (
    <div className="p-4">
      {text && (
        <p className="text-gray-800 mb-4 leading-relaxed">
          {text}
        </p>
      )}
      
      {media && (
        <PostImage 
          src={media.src} 
          alt={media.alt} 
          caption={caption}
        />
      )}
    </div>
  );
};

export default PostContent;