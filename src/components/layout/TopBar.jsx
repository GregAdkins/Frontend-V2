import React from 'react';
import SearchBar from '../navigation/SearchBar';
import LoginButton from '../navigation/LoginButton';

const TopBar = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>
      <LoginButton />
    </div>
  );
};

export default TopBar;