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
const Campaign = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign</h1>
    <p className="text-gray-600">Campaign management and creation tools coming soon.</p>
  </div>
);

const Mission = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Mission</h1>
    <p className="text-gray-600">Mission and goals tracking coming soon.</p>
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
            <Route path="create" element={<CreatePost />} />
            <Route path="campaign" element={<Campaign />} />
            <Route path="mission" element={<Mission />} />
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