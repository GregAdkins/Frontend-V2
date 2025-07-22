import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Hidden by default, shows when sidebarOpen is true */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar}
      />
      
      {/* Main content area - takes full width when sidebar is closed */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <TopBar 
          onMenuClick={handleMenuToggle}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto py-6 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;