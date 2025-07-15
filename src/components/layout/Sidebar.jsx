import React, { useState } from 'react';
import { Home, Compass, Plus, Eye, BarChart3, TrendingUp } from 'lucide-react';
import NavItem from '../navigation/NavItem';

const Sidebar = () => {
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
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600">5th Social</h1>
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
  );
};

export default Sidebar;