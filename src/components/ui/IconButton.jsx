import React from 'react';

const IconButton = ({ icon: Icon, count, isActive, onClick, activeColor = 'text-blue-500' }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center transition-colors ${
        isActive ? activeColor : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 mr-1" />
      {count && <span className="text-sm">{count}</span>}
    </button>
  );
};

export default IconButton;