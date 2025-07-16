import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Calendar, MapPin, Settings } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user?.posts_count || 0}</div>
          <div className="text-sm text-gray-600">Posts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user?.followers_count || 0}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{user?.following_count || 0}</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
            <p className="text-gray-600">Your recent posts and interactions will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;