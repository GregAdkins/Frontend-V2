import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Eye, BarChart3, TrendingUp, Plane } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
    { id: 'create', label: 'Create', icon: Plus, path: '/create' },
    { id: 'explore', label: 'Explore & Art', icon: Eye, path: '/explore' },
    { id: 'data', label: 'Data Environment', icon: BarChart3, path: '/data' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, path: '/trending' },
  ];

  const handleItemClick = (item) => {
    navigate(item.path);
    onClose(); // Close sidebar on mobile after navigation
  };

  const getActiveItem = () => {
    const currentPath = location.pathname;
    return menuItems.find(item => item.path === currentPath)?.id || 'home';
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
          <div className="flex flex-col items-center space-y-2">
            <img 
              src="/logo-5thsocial.png" 
              alt="5th Social" 
              className="h-8 w-auto"
            />
            {/* Pilot Icon */}
            <div className="flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
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