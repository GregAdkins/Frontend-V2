import React from 'react';
import { AppLayout } from './components/layout';
import { PostCard } from './components/post';
import { samplePosts } from './data/sampleData';

const App = () => {
  return (
    <AppLayout>
      {samplePosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

export default App;