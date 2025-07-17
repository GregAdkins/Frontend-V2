import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Calendar, MapPin, Settings, Loader, AlertCircle, MessageCircle, Heart, Share } from 'lucide-react';
import { postsAPI, usersAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch user profile data first
      let userProfileData = null;
      try {
        userProfileData = await usersAPI.getProfile();
      } catch (profileError) {
        console.log('Profile endpoint not available, using posts data');
      }
      
      // Fetch user posts to get the count and recent activity
      const postsResponse = await postsAPI.getAllPosts();
      
      // Filter posts by current user (assuming posts have author field)
      const currentUserPosts = (postsResponse.results || postsResponse || [])
        .filter(post => post.author === user?.name || post.author === user?.username);
      
      setUserPosts(currentUserPosts);
      
      // Set profile data with posts count
      setProfileData({
        ...user,
        ...userProfileData,
        posts_count: currentUserPosts.length
      });
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data');
      
      // Fallback to default data
      setProfileData({
        ...user,
        posts_count: 0
      });
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'share':
        return <Share className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Profile data partially unavailable</p>
            <p className="text-yellow-700 text-sm">Some information may not be up to date.</p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-16 mb-4">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <button className="mt-16 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User Name'}</h1>
              <p className="text-gray-600">@{user?.username || user?.email?.split('@')[0] || 'username'}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {user?.email || 'email@example.com'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </div>
              {user?.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.location}
                </div>
              )}
            </div>
            
            {user?.bio && (
              <p className="text-gray-800">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats - Only showing Posts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {profileData?.posts_count || 0}
          </div>
          <div className="text-gray-600">Posts Published</div>
          <div className="text-sm text-gray-500 mt-1">
            Your total contributions to the community
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon('post')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        You published a new post
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(post.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {post.title || post.content || 'Untitled post'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {post.likes_count || 0} likes
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {post.comments_count || 0} comments
                      </span>
                      <span className="flex items-center">
                        <Share className="w-3 h-3 mr-1" />
                        {post.shares_count || 0} shares
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {userPosts.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing 5 of {userPosts.length} recent activities
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600 mb-4">Start sharing your thoughts to see your activity here.</p>
              <button 
                onClick={() => window.location.href = '/create'}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Posts Section */}
      {userPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Posts</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {userPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {post.title || 'Untitled Post'}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatTimestamp(post.created_at)}</span>
                        <span>{post.likes_count || 0} likes</span>
                        <span>{post.comments_count || 0} comments</span>
                      </div>
                    </div>
                    {post.image && (
                      <div className="ml-4 flex-shrink-0">
                        <img 
                          src={post.image} 
                          alt="Post"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {userPosts.length > 3 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View All {userPosts.length} Posts
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;