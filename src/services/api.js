// src/services/api.js
import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-v2-1vxq.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          localStorage.setItem('access_token', response.access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: async (credentials) => {
    try {
      // First, try to get the username from email
      const loginData = {
        username: credentials.email, // Try email first
        password: credentials.password
      };
      
      let response;
      try {
        response = await api.post('/account/login/', loginData);
      } catch (emailError) {
        // If email login fails, try with username extracted from email
        const usernameFromEmail = credentials.email.split('@')[0];
        const usernameData = {
          username: usernameFromEmail,
          password: credentials.password
        };
        response = await api.post('/account/login/', usernameData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error.response?.data);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      // Map React form data to Django expected format
      const registerData = {
        username: userData.email.split('@')[0], // Create username from email
        email: userData.email,
        password: userData.password
      };
      const response = await api.post('/account/register/', registerData);
      return response.data;
    } catch (error) {
      console.error('Register API Error:', error.response?.data);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // For JWT, we just remove tokens from localStorage
      // No server-side logout needed unless you implement token blacklisting
      return { message: 'Logged out successfully' };
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.error('Logout API Error:', error.response?.data);
      throw error;
    }
  },
  
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/account/token/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error) {
      console.error('Refresh API Error:', error.response?.data);
      throw error;
    }
  }
};

// Users API endpoints
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/account/profile/');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    // Handle FormData for file uploads (avatar, etc.)
    const response = await api.patch('/account/profile/', profileData, {
      headers: {
        'Content-Type': profileData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
  
  getUserPosts: async (username, page = 1) => {
    const response = await api.get(`/account/users/${username}/posts/?page=${page}`);
    return response.data;
  },
  
  getUserStats: async (username) => {
    const response = await api.get(`/account/users/${username}/stats/`);
    return response.data;
  },
  
  getActivity: async (page = 1) => {
    const response = await api.get(`/account/activity/?page=${page}`);
    return response.data;
  }
};

// Posts API endpoints
export const postsAPI = {
  getAllPosts: async (page = 1) => {
    const response = await api.get(`/posts/?page=${page}`);
    return response.data;
  },
  
  createPost: async (postData) => {
    // Handle FormData for file uploads
    const response = await api.post('/posts/', postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getPost: async (slug) => {
    const response = await api.get(`/posts/${slug}/`);
    return response.data;
  },
  
  updatePost: async (slug, postData) => {
    const response = await api.patch(`/posts/${slug}/`, postData);
    return response.data;
  },
  
  deletePost: async (slug) => {
    const response = await api.delete(`/posts/${slug}/`);
    return response.data;
  },
  
  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like/`);
    return response.data;
  },
  
  sharePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/share/`);
    return response.data;
  },
  
  getComments: async (postId, page = 1) => {
    const response = await api.get(`/posts/${postId}/comments/?page=${page}`);
    return response.data;
  },
  
  createComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments/`, commentData);
    return response.data;
  },
  
  searchPosts: async (query, page = 1) => {
    const response = await api.get(`/posts/search/?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  },
  
  // Get posts by specific user
  getPostsByUser: async (username, page = 1) => {
    const response = await api.get(`/posts/?author=${username}&page=${page}`);
    return response.data;
  }
};

export default api;
