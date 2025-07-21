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


const Campaign = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign</h1>
    <p className="text-gray-600">Campaign management and creation tools coming soon.</p>
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-blue-800 text-sm">
        This view will contain campaign creation, management, and tracking features.
      </p>
    </div>
  </div>
);

const Mission = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission</h1>
    <p className="text-gray-600">Mission and goals tracking coming soon.</p>
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800 text-sm">
        This view will contain mission objectives, progress tracking, and goal management.
      </p>
    </div>
  </div>
);

const DataEnvironment = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Data Environment</h1>
    <p className="text-gray-600">Data analytics and insights dashboard coming soon.</p>
    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <p className="text-purple-800 text-sm">
        This view will contain data visualization, analytics, and reporting tools.
      </p>
    </div>
  </div>
);

const Trending = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Trending</h1>
    <p className="text-gray-600">Trending content and topics coming soon.</p>
    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <p className="text-orange-800 text-sm">
        This view will show trending posts, topics, and popular content.
      </p>
    </div>
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
            {/* Main Feed Route (was Home, now Feed) */}
            <Route index element={<Home />} />
            
            {/* Landing Page Navigation Routes */}
            <Route path="campaign" element={<Campaign />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="mission" element={<Mission />} />
            <Route path="profile" element={<Profile />} />
            <Route path="data" element={<DataEnvironment />} />
            <Route path="trending" element={<Trending />} />
            
            {/* Post Detail */}
            <Route path="post/:slug" element={<PostDetail />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="discover" element={<Navigate to="/campaign" replace />} />
            <Route path="explore" element={<Navigate to="/mission" replace />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;