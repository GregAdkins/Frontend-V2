import React from 'react';

const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 lg:px-6 py-3 text-left transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
      <span className="font-medium hidden lg:block">{label}</span>
    </button>
  );
};

export default NavItem;