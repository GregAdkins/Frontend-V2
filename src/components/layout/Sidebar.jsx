import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Plus, 
  Eye, 
  BarChart3, 
  TrendingUp,
  FileText,
  Image,
  Video,
  BookOpen,
  Workflow,
  ChevronRight,
  X
} from 'lucide-react';
import NavItem from '../navigation/NavItem';

const CreateMenuItem = ({ icon: Icon, label, description, onClick, color = "text-gray-600" }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-blue-50 transition-colors`}>
        <Icon className={`w-5 h-5 ${color} group-hover:text-blue-600 transition-colors`} />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {label}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </button>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'discover', label: 'Discover', icon: Compass, path: '/discover' },
    { id: 'create', label: 'Create', icon: Plus, path: '/create', hasSubmenu: true },
    { id: 'explore', label: 'Explore & Art', icon: Eye, path: '/explore' },
    { id: 'data', label: 'Data Environment', icon: BarChart3, path: '/data' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, path: '/trending' },
  ];

  const createMenuItems = [
    {
      id: 'post',
      label: 'Post',
      description: 'Share text, photos, or videos',
      icon: FileText,
      color: 'text-blue-600',
      path: '/create'
    },
    {
      id: 'image',
      label: 'Image',
      description: 'Upload and share photos',
      icon: Image,
      color: 'text-green-600',
      path: '/create?type=image'
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Share video content',
      icon: Video,
      color: 'text-purple-600',
      path: '/create?type=video'
    },
    {
      id: 'story',
      label: 'Story',
      description: 'Create engaging stories',
      icon: BookOpen,
      color: 'text-orange-600',
      path: '/create?type=story'
    },
    {
      id: 'workflow',
      label: 'Workflow',
      description: 'Design process workflows',
      icon: Workflow,
      color: 'text-red-600',
      path: '/create?type=workflow'
    }
  ];

  const handleItemClick = (item) => {
    if (item.hasSubmenu) {
      setShowCreateMenu(true);
    } else {
      navigate(item.path);
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  const handleCreateMenuItemClick = (item) => {
    navigate(item.path);
    setShowCreateMenu(false);
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
          <h1 className="text-xl lg:text-2xl font-bold text-blue-600">5th Social</h1>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
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

      {/* Create Menu Slide-in */}
      <div className={`
        fixed inset-0 z-60 lg:z-50 transition-opacity duration-300
        ${showCreateMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowCreateMenu(false)}
        />
        
        {/* Create Menu Panel */}
        <div className={`
          absolute top-0 left-0 lg:left-64 xl:left-72 h-full w-80 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${showCreateMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">CREATE</h2>
              <p className="text-sm text-gray-600 mt-1">Choose what to create</p>
            </div>
            <button
              onClick={() => setShowCreateMenu(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Create Options */}
          <div className="py-4">
            {createMenuItems.map((item) => (
              <CreateMenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                description={item.description}
                color={item.color}
                onClick={() => handleCreateMenuItemClick(item)}
              />
            ))}
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              More creation tools coming soon
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;