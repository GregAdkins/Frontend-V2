import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SearchBar from '../navigation/SearchBar';

const TopBar = ({ onMenuClick }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

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
            
            <div className="lg:hidden flex flex-col items-center space-y-2">
              {}
              <img 
                src="/5thsocial-logo.png" 
                alt="5th Social" 
                className="h-10 w-auto"
              />
              {}
              <img 
                src="/s-logo.png" 
                alt="S" 
                className="h-5 w-auto opacity-80"
              />
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
            
            {}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="hidden md:block font-medium">{user?.name || 'User'}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
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