import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Target, Flag, Eye, User, ArrowLeft } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  
  // Updated menu items to match the image
  const menuItems = [
    { id: 'create', label: 'Create', icon: Plus, path: '/create', hasSubMenu: true },
    { id: 'home', label: 'Feed', icon: Home, path: '/' },
    { id: 'campaign', label: 'Campaign', icon: Flag, path: '/campaign' },
    { id: 'mission', label: 'Mission', icon: Target, path: '/mission' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  const createOptions = [
    { id: 'post', label: 'Post', icon: Home, path: '/create?type=post', description: 'Share your thoughts' },
    { id: 'image', label: 'Image', icon: Eye, path: '/create?type=image', description: 'Upload photos' },
    { id: 'video', label: 'Video', icon: Eye, path: '/create?type=video', description: 'Share videos' },
    { id: 'story', label: 'Story', icon: Eye, path: '/create?type=story', description: 'Tell a story' },
    { id: 'workflow', label: 'Workflow', icon: Eye, path: '/create?type=workflow', description: 'Design process' },
  ];

  const handleItemClick = (item) => {
    if (item.hasSubMenu) {
      setShowCreatePanel(!showCreatePanel);
    } else {
      navigate(item.path);
      onClose(); // Close sidebar on mobile after navigation
      setShowCreatePanel(false);
    }
  };

  const handleCreateOptionClick = (option) => {
    navigate(option.path);
    onClose();
    setShowCreatePanel(false);
  };

  const handleBackToMainNav = () => {
    setShowCreatePanel(false);
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
        fixed lg:fixed z-50 lg:z-auto
        w-64 lg:w-64 xl:w-72 bg-white border-r border-gray-200 h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-hidden
      `}>
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-gray-100 flex flex-col items-center space-y-3">
          {/* Main 5thSocial Logo */}
          <img 
            src="/5thsocial-logo.png" 
            alt="5th Social" 
            className="h-12 lg:h-14 w-auto"
          />
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <div className="w-6 h-6" />
          </button>
        </div>
        
        {/* Navigation Container */}
        <div className="relative h-full overflow-hidden">
          {/* Main Navigation */}
          <nav className={`
            absolute inset-0 transition-transform duration-300 ease-in-out
            ${showCreatePanel ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          `}>
            <div className="mt-6 space-y-1">
              {menuItems.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={getActiveItem() === item.id || (item.id === 'create' && showCreatePanel)}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          </nav>

          {/* Mobile: Create Panel (slides from right) */}
          <div className={`
            lg:hidden absolute inset-0 bg-white
            transition-transform duration-300 ease-in-out
            ${showCreatePanel ? 'translate-x-0' : 'translate-x-full'}
          `}>
            {/* Create Panel Header */}
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <div className="flex items-center">
                <button
                  onClick={handleBackToMainNav}
                  className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">CREATE</h2>
                  <p className="text-gray-600 text-sm">Choose what you want to create</p>
                </div>
              </div>
            </div>
            
            {/* Create Options */}
            <div className="p-4 space-y-2 overflow-y-auto">
              {createOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCreateOptionClick(option)}
                  className="w-full flex items-center p-4 text-left rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <option.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{option.label}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Create Panel Slide-out */}
      {showCreatePanel && isOpen && (
        <div className={`
          hidden lg:block
          fixed z-40
          left-64 xl:left-72 top-0 h-screen
          w-80 bg-white border-r border-gray-200 shadow-lg
          transition-transform duration-300 ease-in-out
          ${showCreatePanel ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">CREATE</h2>
            <p className="text-gray-600 text-sm">Choose what you want to create</p>
          </div>
          
          {/* Create Options */}
          <div className="p-4 space-y-2">
            {createOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleCreateOptionClick(option)}
                className="w-full flex items-center p-4 text-left rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                  <option.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{option.label}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Panel Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setShowCreatePanel(false)}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;