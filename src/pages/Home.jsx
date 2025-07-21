import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/post';
import { postsAPI } from '../services/api';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await postsAPI.getAllPosts();
      // Django pagination returns results in 'results' field
      setPosts(response.results || response || []);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
      
      // Fallback to sample data if API fails
      const samplePosts = [
        {
          id: 1,
          author: 'Lara Roe',
          slug: 'sample-post-1',
          content: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum is simply dummy text of the printing and typesetting industry.',
          image: '/api/placeholder/500/300',
          created_at: '2024-01-01T12:00:00Z',
          likes_count: 5400,
          comments_count: 789,
          shares_count: 1400
        },
        {
          id: 2,
          author: 'John Smith',
          slug: 'sample-post-2',
          content: 'Just finished working on an amazing project! The future of technology is here and it\'s incredible to be part of this journey.',
          image: '/api/placeholder/500/300',
          created_at: '2024-01-01T10:00:00Z',
          likes_count: 2100,
          comments_count: 234,
          shares_count: 567
        }
      ];
      setPosts(samplePosts);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRefresh = () => {
    fetchPosts(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Updated to reflect Feed naming */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Unable to connect to server</p>
            <p className="text-yellow-700 text-sm">Showing sample posts. Check your connection and try refreshing.</p>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something with the community!</p>
        </div>
      )}
    </div>
  );
};

export default Home;