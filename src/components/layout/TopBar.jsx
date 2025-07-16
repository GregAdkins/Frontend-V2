import React, { useState } from 'react';
import SearchBar from '../navigation/SearchBar';
import { Menu, Search, X } from 'lucide-react';

const TopBar = ({ onMenuClick, onAuthClick }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
      {!showMobileSearch ? (
        <>
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
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="sm:hidden text-gray-600 hover:text-gray-900"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onAuthClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Join
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-4 w-full sm:hidden">
          <div className="flex-1">
            <SearchBar />
          </div>
          <button 
            onClick={() => setShowMobileSearch(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;