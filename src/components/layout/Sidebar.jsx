import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Eye, BarChart3, TrendingUp, User } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Updated menu items with your landing page navigation names
  const menuItems = [
    { id: 'feed', label: 'Feed', icon: Home, path: '/' },
    { id: 'campaign', label: 'Campaign', icon: Compass, path: '/campaign' },
    { id: 'create', label: 'Create', icon: Plus, path: '/create' },
    { id: 'mission', label: 'Mission', icon: Eye, path: '/mission' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'data', label: 'Data Environment', icon: BarChart3, path: '/data' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, path: '/trending' },
  ];

  const handleItemClick = (item) => {
    navigate(item.path);
    onClose(); // Close sidebar on mobile after navigation
  };

  const getActiveItem = () => {
    const currentPath = location.pathname;
    return menuItems.find(item => item.path === currentPath)?.id || 'feed';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
        w-64 lg:w-64 xl:w-72 bg-white border-r border-gray-200 h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex flex-col items-center space-y-3">
            {/* Main 5thSocial Logo */}
            <img 
              src="/5thsocial-logo.png" 
              alt="5th Social" 
              className="h-12 lg:h-14 w-auto"
            />
            {/* S Logo (replacing plane icon) */}
            <img 
              src="/s-logo.png" 
              alt="S" 
              className="h-6 w-auto opacity-80"
            />
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <div className="w-6 h-6" />
          </button>
        </div>
        
        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={getActiveItem() === item.id}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;