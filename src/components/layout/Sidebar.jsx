import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, Eye, BarChart3, TrendingUp, FileText, Image, Video, BookOpen, Workflow, Target, ChevronRight, ChevronDown } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Compass, path: '/search' },
    { id: 'create', label: 'Create', icon: Plus, path: '/create', hasSubMenu: true },
    { id: 'mission', label: 'Mission', icon: Target, path: '/mission' },
    { id: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
    { id: 'explore', label: 'Explore & Art', icon: Eye, path: '/explore' },
    { id: 'data', label: 'Data Environment', icon: BarChart3, path: '/data' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, path: '/trending' },
  ];

  const createOptions = [
    { id: 'post', label: 'Post', icon: FileText, path: '/create?type=post', description: 'Share your thoughts' },
    { id: 'image', label: 'Image', icon: Image, path: '/create?type=image', description: 'Upload photos' },
    { id: 'video', label: 'Video', icon: Video, path: '/create?type=video', description: 'Share videos' },
    { id: 'story', label: 'Story', icon: BookOpen, path: '/create?type=story', description: 'Tell a story' },
    { id: 'workflow', label: 'Workflow', icon: Workflow, path: '/create?type=workflow', description: 'Design process' },
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

  const getActiveItem = () => {
    const currentPath = location.pathname;
    return menuItems.find(item => item.path === currentPath)?.id || 'home';
  };

  // Custom NavItem component for Create with expandable functionality
  const CreateNavItem = ({ icon: Icon, label, isActive, onClick, hasSubMenu, isExpanded }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 lg:px-6 py-3 text-left transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className="font-medium">{label}</span>
        </div>
        {hasSubMenu && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            )}
          </div>
        )}
      </button>
    );
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
        overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
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
        <nav className="mt-6 flex-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.hasSubMenu ? (
                <CreateNavItem
                  icon={item.icon}
                  label={item.label}
                  isActive={getActiveItem() === item.id || showCreatePanel}
                  onClick={() => handleItemClick(item)}
                  hasSubMenu={item.hasSubMenu}
                  isExpanded={showCreatePanel}
                />
              ) : (
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  isActive={getActiveItem() === item.id}
                  onClick={() => handleItemClick(item)}
                />
              )}
              
              {/* Mobile: Inline Create Options (shows within the main nav) */}
              {item.hasSubMenu && showCreatePanel && (
                <div className="lg:hidden bg-gray-50 border-t border-gray-200">
                  <div className="py-2">
                    {createOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleCreateOptionClick(option)}
                        className="w-full flex items-center px-8 py-3 text-left hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                          <option.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{option.label}</h3>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Desktop: Create Panel Slide-out (only shown on lg+ screens) */}
      {showCreatePanel && (
        <div className={`
          hidden lg:block
          fixed lg:absolute z-40 lg:z-30
          left-64 lg:left-64 xl:left-72 top-0 h-screen
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