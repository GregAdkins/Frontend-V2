import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import EmailVerification from './pages/EmailVerification';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Placeholder components for new routes
const Search = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search for posts, users, or topics..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <p className="text-gray-600">Advanced search functionality coming soon.</p>
  </div>
);

const Mission = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission</h1>
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Our Mission</h3>
        <p className="text-green-800 text-sm">
          To create a platform that connects people through meaningful content and authentic interactions.
        </p>
      </div>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Your Mission</h3>
        <p className="text-blue-800 text-sm">
          Set and track your personal goals and missions within the community.
        </p>
      </div>
    </div>
    <p className="text-gray-600 mt-4">Mission tracking and goal management features coming soon.</p>
  </div>
);

const Campaign = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign</h1>
    <p className="text-gray-600">Campaign management and creation tools coming soon.</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Main Feed Route */}
            <Route index element={<Home />} />
            
            {/* Navigation Routes */}
            <Route path="search" element={<Search />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="mission" element={<Mission />} />
            <Route path="campaign" element={<Campaign />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Post Detail */}
            <Route path="post/:slug" element={<PostDetail />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="discover" element={<Navigate to="/campaign" replace />} />
            <Route path="explore" element={<Navigate to="/mission" replace />} />
            <Route path="data" element={<Navigate to="/mission" replace />} />
            <Route path="trending" element={<Navigate to="/" replace />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;