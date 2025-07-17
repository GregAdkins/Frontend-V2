import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const savedUser = localStorage.getItem('user');
    
    if (accessToken && refreshToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // JWT response structure: { access, refresh, user }
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Use user info from response if available, otherwise create from email
      const userInfo = response.user || {
        email: credentials.email,
        name: response.user?.first_name && response.user?.last_name 
          ? `${response.user.first_name} ${response.user.last_name}`.trim()
          : response.user?.username || credentials.email.split('@')[0],
        username: response.user?.username || credentials.email.split('@')[0]
      };
      
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      setIsAuthenticated(true);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.data?.errors?.non_field_errors) {
        errorMessage = error.response.data.errors.non_field_errors[0];
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and make sure your email is verified.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your email and password.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with:', { 
        name: userData.name, 
        email: userData.email 
      });
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      // Registration successful - user needs to verify email
      // Don't auto-login since email verification is required
      return { 
        success: true, 
        data: response,
        message: response.message || 'Registration successful! Please check your email to verify your account.'
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.email) {
        errorMessage = error.response.data.email[0];
      } else if (error.response?.data?.username) {
        errorMessage = error.response.data.username[0];
      } else if (error.response?.data?.password) {
        errorMessage = error.response.data.password[0];
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your information and try again';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};