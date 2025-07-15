import React from 'react';

const PostImage = ({ src, alt, caption }) => {
  return (
    <div className="mb-4">
      <div className="rounded-lg overflow-hidden mb-3">
        <img 
          src={src} 
          alt={alt}
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {caption && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{caption.title}</span>
          {caption.subtitle && (
            <>
              <br />
              <span className="text-gray-500">{caption.subtitle}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostImage;