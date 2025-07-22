import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network/CORS Error:', {
        baseURL: API_BASE_URL,
        requestURL: error.config?.url,
        message: 'Please check if Django server is running on http://localhost:8000'
      });
      return Promise.reject({
        ...error,
        message: 'Unable to connect to server. Please check if the backend is running.'
      });
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          localStorage.setItem('access_token', response.access);
          
          originalRequest.headers.Authorization = `Bearer ${response.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
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
      console.log('Login attempt to:', `${API_BASE_URL}/account/login/`);
      
      const response = await api.post('/account/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('Login successful');
      return response.data;
    } catch (error) {
      console.error('Login failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Registration attempt to:', `${API_BASE_URL}/account/register/`);
      
      const response = await api.post('/account/register/', {
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password
      });
      
      console.log('Registration successful');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  logout: async () => {
    return { message: 'Logged out successfully' };
  },
  
  refreshToken: async (refreshToken) => {
    const response = await api.post('/account/token/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  }
};

// Users API endpoints
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/account/profile/');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.patch('/account/profile/', profileData, {
      headers: {
        'Content-Type': profileData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  }
};

// Posts API endpoints - Simplified for integer IDs and slugs
export const postsAPI = {
  // Get all posts with filtering
  getAllPosts: async (page = 1, filters = {}) => {
    try {
      let url = `/posts/?page=${page}`;
      
      // Add filters
      if (filters.content_type) url += `&content_type=${filters.content_type}`;
      if (filters.author) url += `&author=${filters.author}`;
      if (filters.status) url += `&status=${filters.status}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  },
  
  // Get posts by content type
  getPostsByType: async (contentType, page = 1) => {
    try {
      const response = await api.get(`/posts/${contentType}s/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Get posts by type error:', error);
      throw error;
    }
  },
  
  // Create post
  createPost: async (postData) => {
    try {
      console.log('Creating post with data type:', postData instanceof FormData ? 'FormData' : 'JSON');
      
      const response = await api.post('/posts/', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create post error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  // Get single post (by slug)
  getPost: async (slug) => {
    try {
      console.log('Fetching post with slug:', slug);
      const response = await api.get(`/posts/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Get post error:', error);
      throw error;
    }
  },
  
  // Update post
  updatePost: async (slug, postData) => {
    try {
      const response = await api.patch(`/posts/${slug}/`, postData, {
        headers: {
          'Content-Type': postData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  },
  
  // Delete post
  deletePost: async (slug) => {
    try {
      const response = await api.delete(`/posts/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },
  
  // Like/unlike post
  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Like post error:', error);
      throw error;
    }
  },
  
  // Share post
  sharePost: async (postId, shareText = '') => {
    try {
      const response = await api.post(`/posts/${postId}/share/`, {
        share_text: shareText
      });
      return response.data;
    } catch (error) {
      console.error('Share post error:', error);
      throw error;
    }
  },
  
  // Bookmark/unbookmark post
  bookmarkPost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/bookmark/`);
      return response.data;
    } catch (error) {
      console.error('Bookmark post error:', error);
      throw error;
    }
  },
  
  // Get user's bookmarks
  getMyBookmarks: async (page = 1) => {
    const response = await api.get(`/posts/my-bookmarks/?page=${page}`);
    return response.data;
  },
  
  // Get trending posts
  getTrendingPosts: async () => {
    const response = await api.get('/posts/trending/');
    return response.data;
  },
  
  // Enhanced search
  searchPosts: async (query, filters = {}, page = 1) => {
    try {
      let url = `/posts/search/?q=${encodeURIComponent(query)}&page=${page}`;
      
      if (filters.content_type) url += `&content_type=${filters.content_type}`;
      if (filters.author) url += `&author=${filters.author}`;
      if (filters.tags) url += `&tags=${encodeURIComponent(filters.tags)}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Search posts error:', error);
      throw error;
    }
  },
  
  // Get posts by user
  getUserPosts: async (username, page = 1, contentType = '') => {
    let url = `/posts/user/${username}/?page=${page}`;
    if (contentType) url += `&content_type=${contentType}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Get post statistics (owner only)
  getPostStats: async (slug) => {
    try {
      const response = await api.get(`/posts/${slug}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Get post stats error:', error);
      throw error;
    }
  },
  
  // Bulk operations
  bulkDeletePosts: async (postIds) => {
    const response = await api.post('/posts/bulk/delete/', {
      post_ids: postIds
    });
    return response.data;
  },
  
  bulkUpdateStatus: async (postIds, status) => {
    const response = await api.post('/posts/bulk/update-status/', {
      post_ids: postIds,
      status: status
    });
    return response.data;
  },
  
  // Comments
  getComments: async (postId, page = 1) => {
    try {
      const response = await api.get(`/posts/${postId}/comments/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },
  
  createComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/posts/${postId}/comments/`, commentData);
      return response.data;
    } catch (error) {
      console.error('Create comment error:', error);
      throw error;
    }
  },
  
  getCommentReplies: async (commentId) => {
    const response = await api.get(`/posts/comments/${commentId}/replies/`);
    return response.data;
  },
  
  // Content type specific helpers
  getImagePosts: async (page = 1) => {
    return postsAPI.getPostsByType('image', page);
  },
  
  getVideoPosts: async (page = 1) => {
    return postsAPI.getPostsByType('video', page);
  },
  
  getStoryPosts: async (page = 1) => {
    return postsAPI.getPostsByType('story', page);
  },
  
  getWorkflowPosts: async (page = 1) => {
    return postsAPI.getPostsByType('workflow', page);
  }
};

// Utility functions for post handling
export const postUtils = {
  // Get post identifier (use slug for URLs)
  getPostIdentifier: (post) => {
    return post.slug || post.id;
  },
  
  // Build post URL for navigation
  buildPostUrl: (post) => {
    // Use slug for SEO-friendly URLs
    if (post.slug) {
      return `/post/${post.slug}`;
    } else if (post.id) {
      return `/post/${post.id}`;
    }
    return '/';
  }
};

// Content type utilities
export const contentTypeUtils = {
  // Validate file type on frontend
  validateFile: (file, contentType) => {
    const validations = {
      image: {
        types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        label: 'Image'
      },
      video: {
        types: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        maxSize: 100 * 1024 * 1024, // 100MB
        label: 'Video'
      }
    };
    
    const validation = validations[contentType === 'video' && file.type.startsWith('video/') ? 'video' : 'image'];
    
    if (!validation) {
      return { valid: false, error: 'Unknown content type' };
    }
    
    if (!validation.types.includes(file.type)) {
      return { 
        valid: false, 
        error: `Invalid ${validation.label.toLowerCase()} format. Supported: ${validation.types.join(', ')}` 
      };
    }
    
    if (file.size > validation.maxSize) {
      return { 
        valid: false, 
        error: `${validation.label} size cannot exceed ${validation.maxSize / (1024 * 1024)}MB` 
      };
    }
    
    return { valid: true };
  },
  
  // Get content type configuration
  getContentTypeConfig: (contentType) => {
    const configs = {
      post: { label: 'Post', icon: 'FileText', color: 'blue' },
      image: { label: 'Image', icon: 'Image', color: 'green' },
      video: { label: 'Video', icon: 'Video', color: 'purple' },
      story: { label: 'Story', icon: 'BookOpen', color: 'orange' },
      workflow: { label: 'Workflow', icon: 'Workflow', color: 'red' }
    };
    
    return configs[contentType] || configs.post;
  },
  
  // Format workflow steps for display
  formatWorkflowSteps: (steps) => {
    try {
      return typeof steps === 'string' ? JSON.parse(steps) : steps;
    } catch (error) {
      console.error('Error parsing workflow steps:', error);
      return [];
    }
  }
};

// Error handling utilities
export const apiErrorHandler = {
  // Parse Django validation errors
  parseValidationErrors: (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle Django REST framework validation errors
      if (typeof data === 'object' && !Array.isArray(data)) {
        const errors = {};
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            errors[key] = data[key][0]; // Take first error message
          } else {
            errors[key] = data[key];
          }
        });
        return errors;
      }
      
      // Handle string errors
      if (typeof data === 'string') {
        return { general: data };
      }
    }
    
    return { general: error.message || 'An unexpected error occurred' };
  },
  
  // Get user-friendly error message
  getUserFriendlyMessage: (error) => {
    const errors = apiErrorHandler.parseValidationErrors(error);
    
    // Priority order for displaying errors
    const priorityFields = ['general', 'detail', 'non_field_errors', 'title', 'content', 'image', 'video'];
    
    for (const field of priorityFields) {
      if (errors[field]) {
        return errors[field];
      }
    }
    
    // Return first available error
    const firstError = Object.values(errors)[0];
    return firstError || 'An unexpected error occurred';
  }
};

export default api;