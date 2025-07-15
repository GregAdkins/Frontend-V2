import React from 'react';
// import { AppLayout } from './components/layout';
import { PostCard } from './components/post';
import { samplePosts } from './data/sampleData';
import {Sidebar} from './components/layout';
import {TopBar} from './components/layout';
import {MainContent} from './components/layout';
import AuthModal from './components/auth/AuthModal';
import { useState } from "react";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)}
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <MainContent>
          {samplePosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </MainContent>
      </div>
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
