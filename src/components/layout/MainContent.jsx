import React from 'react';

const MainContent = ({ children }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-6">
        {children}
      </div>
    </div>
  );
};

export default MainContent;