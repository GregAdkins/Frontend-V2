import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for video uploads
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
    
    // Set appropriate content type for file uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Let browser set it
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

// Posts API endpoints with enhanced video support
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
  
  // Create post with enhanced file upload support
  createPost: async (postData) => {
    try {
      console.log('Creating post with data type:', postData instanceof FormData ? 'FormData' : 'JSON');
      
      // Log FormData contents for debugging
      if (postData instanceof FormData) {
        console.log('FormData contents:');
        for (let [key, value] of postData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for large video uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      };
      
      const response = await api.post('/posts/', postData, config);
      
      console.log('Post created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create post error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Enhanced error handling for file upload issues
      if (error.response?.status === 413) {
        throw new Error('File too large. Please reduce file size and try again.');
      } else if (error.response?.status === 415) {
        throw new Error('Unsupported file format. Please check file requirements.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again with a smaller file.');
      }
      
      throw error;
    }
  },
  
  // Get single post (by slug) with media URLs
  getPost: async (slug) => {
    try {
      console.log('Fetching post with slug:', slug);
      const response = await api.get(`/posts/${slug}/`);
      
      // Ensure we have proper URL fields
      const post = response.data;
      console.log('Post data received:', {
        id: post.id,
        title: post.title,
        content_type: post.content_type,
        has_image: !!post.image_url,
        has_video: !!post.video_url,
        has_thumbnail: !!post.video_thumbnail_url
      });
      
      return post;
    } catch (error) {
      console.error('Get post error:', error);
      throw error;
    }
  },
  
  // Update post
  updatePost: async (slug, postData) => {
    try {
      const config = {};
      if (postData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
        config.timeout = 120000; // Extended timeout for media uploads
      }
      
      const response = await api.patch(`/posts/${slug}/`, postData, config);
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
  
  // Enhanced search with video support
  searchPosts: async (query, filters = {}, page = 1) => {
    try {
      let url = `/posts/search/?q=${encodeURIComponent(query)}&page=${page}`;
      
      if (filters.content_type) url += `&content_type=${filters.content_type}`;
      if (filters.author) url += `&author=${filters.author}`;
      if (filters.tags) url += `&tags=${encodeURIComponent(filters.tags)}`;
      if (filters.has_video !== undefined) url += `&has_video=${filters.has_video}`;
      if (filters.has_image !== undefined) url += `&has_image=${filters.has_image}`;
      
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
  
  // Content type specific helpers with video support
  getImagePosts: async (page = 1) => {
    return postsAPI.getAllPosts(page, { content_type: 'image' });
  },
  
  getVideoPosts: async (page = 1) => {
    return postsAPI.getAllPosts(page, { content_type: 'video' });
  },
  
  getStoryPosts: async (page = 1) => {
    return postsAPI.getAllPosts(page, { content_type: 'story' });
  },
  
  getWorkflowPosts: async (page = 1) => {
    return postsAPI.getAllPosts(page, { content_type: 'workflow' });
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
  },
  
  // Check if post has video content
  hasVideo: (post) => {
    return !!(post.video_url || post.content_type === 'video');
  },
  
  // Check if post has image content
  hasImage: (post) => {
    return !!(post.image_url || post.content_type === 'image');
  },
  
  // Get appropriate media URL for display
  getMediaUrl: (post, preferVideo = false) => {
    if (preferVideo && post.video_url) {
      return post.video_url;
    }
    if (post.image_url) {
      return post.image_url;
    }
    if (post.video_thumbnail_url) {
      return post.video_thumbnail_url;
    }
    return null;
  },
  
  // Get thumbnail URL (for video posts, prefer thumbnail over video)
  getThumbnailUrl: (post) => {
    if (post.video_thumbnail_url) {
      return post.video_thumbnail_url;
    }
    if (post.image_url) {
      return post.image_url;
    }
    return null;
  }
};

// Content type utilities with video validation
export const contentTypeUtils = {
  // Enhanced file validation
  validateFile: (file, contentType) => {
    const validations = {
      image: {
        types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        label: 'Image',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      video: {
        types: [
          'video/mp4', 'video/webm', 'video/ogg', 
          'video/quicktime', 'video/avi', 'video/mov'
        ],
        maxSize: 100 * 1024 * 1024, // 100MB
        label: 'Video',
        extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi']
      }
    };
    
    const fileType = contentType === 'video' && file.type.startsWith('video/') ? 'video' : 'image';
    const validation = validations[fileType];
    
    if (!validation) {
      return { valid: false, error: 'Unknown content type' };
    }
    
    // Check file size
    if (file.size > validation.maxSize) {
      return { 
        valid: false, 
        error: `${validation.label} size (${(file.size / (1024 * 1024)).toFixed(1)}MB) cannot exceed ${validation.maxSize / (1024 * 1024)}MB` 
      };
    }
    
    // Check file type
    const isValidType = validation.types.some(type => file.type.toLowerCase().includes(type.split('/')[1]));
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = validation.extensions.includes(fileExtension);
    
    if (!isValidType && !isValidExtension) {
      return { 
        valid: false, 
        error: `Unsupported ${validation.label.toLowerCase()} format. Supported: ${validation.extensions.map(ext => ext.toUpperCase()).join(', ')}` 
      };
    }
    
    // Warning for large files
    const warnings = [];
    if (file.size > validation.maxSize * 0.8) {
      warnings.push(`Large ${validation.label.toLowerCase()} may take longer to upload`);
    }
    
    return { 
      valid: true, 
      warnings,
      fileType,
      sizeMB: (file.size / (1024 * 1024)).toFixed(1)
    };
  },
  
  // Get content type configuration
  getContentTypeConfig: (contentType) => {
    const configs = {
      post: { label: 'Post', icon: 'FileText', color: 'blue', supportsVideo: true, supportsImage: true },
      image: { label: 'Image', icon: 'Image', color: 'green', supportsVideo: false, supportsImage: true },
      video: { label: 'Video', icon: 'Video', color: 'purple', supportsVideo: true, supportsImage: true },
      story: { label: 'Story', icon: 'BookOpen', color: 'orange', supportsVideo: false, supportsImage: true },
      workflow: { label: 'Workflow', icon: 'Workflow', color: 'red', supportsVideo: false, supportsImage: true }
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
  
  // Get user-friendly error message with file upload context
  getUserFriendlyMessage: (error) => {
    const errors = apiErrorHandler.parseValidationErrors(error);
    
    // Priority order for displaying errors
    const priorityFields = ['general', 'detail', 'non_field_errors', 'image', 'video', 'title', 'content'];
    
    for (const field of priorityFields) {
      if (errors[field]) {
        // Enhance file upload error messages
        if (field === 'image' || field === 'video') {
          return `${field.charAt(0).toUpperCase() + field.slice(1)} upload error: ${errors[field]}`;
        }
        return errors[field];
      }
    }
    
    // Return first available error
    const firstError = Object.values(errors)[0];
    return firstError || 'An unexpected error occurred';
  }
};

export default api;