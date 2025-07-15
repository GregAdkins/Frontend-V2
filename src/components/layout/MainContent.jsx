import React from 'react';

const MainContent = ({ children }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {children}
      </div>
    </div>
  );
};

export default MainContent;