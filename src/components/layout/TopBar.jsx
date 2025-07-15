import React from 'react';
import SearchBar from '../navigation/SearchBar';
import { Menu } from 'lucide-react';
import { Search } from 'lucide-react';

const TopBar = ({ onMenuClick, onAuthClick }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="lg:hidden">
          <h1 className="text-xl font-bold text-blue-600">5th Social</h1>
        </div>
        
        <div className="hidden sm:block">
          <SearchBar />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="sm:hidden">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <button 
          onClick={onAuthClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default TopBar;