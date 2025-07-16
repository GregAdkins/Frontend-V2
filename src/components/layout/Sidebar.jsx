import React, { useState } from 'react';
import { Home, Compass, Plus, Eye, BarChart3, TrendingUp } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = ({ isOpen, onClose, onCreatePost }) => {
  const [activeItem, setActiveItem] = useState('home');
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'explore', label: 'Explore & Art', icon: Eye },
    { id: 'data', label: 'Data Environment', icon: BarChart3 },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

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
              isActive={activeItem === item.id}
              onClick={() => setActiveItem(item.id)}
            />
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;