import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Image, 
  Upload, 
  Type, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Video,
  BookOpen,
  Workflow,
  Camera
} from 'lucide-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const contentType = searchParams.get('type') || 'post';
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    images: [],
    contentType: contentType
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Content type configurations
  const contentTypeConfig = {
    post: {
      title: 'Create New Post',
      subtitle: 'Share your thoughts with the community',
      icon: FileText,
      color: 'text-blue-600',
      placeholderTitle: 'Give your post a catchy title...',
      placeholderContent: 'Share your thoughts, ideas, or story...',
      acceptedFiles: 'image/*',
      maxFiles: 5
    },
    image: {
      title: 'Share Image Content',
      subtitle: 'Upload and share your photos',
      icon: Image,
      color: 'text-green-600',
      placeholderTitle: 'Add a caption for your image...',
      placeholderContent: 'Describe your image or add context...',
      acceptedFiles: 'image/*',
      maxFiles: 10
    },
    video: {
      title: 'Share Video Content',
      subtitle: 'Upload and share your videos',
      icon: Video,
      color: 'text-purple-600',
      placeholderTitle: 'Give your video a title...',
      placeholderContent: 'Describe your video content...',
      acceptedFiles: 'video/*,image/*',
      maxFiles: 3
    },
    story: {
      title: 'Create a Story',
      subtitle: 'Tell an engaging story',
      icon: BookOpen,
      color: 'text-orange-600',
      placeholderTitle: 'Your story title...',
      placeholderContent: 'Write your story here. Tell us what happened, what you learned, or what you want to share...',
      acceptedFiles: 'image/*',
      maxFiles: 8
    },
    workflow: {
      title: 'Design Workflow',
      subtitle: 'Create and share process workflows',
      icon: Workflow,
      color: 'text-red-600',
      placeholderTitle: 'Workflow name...',
      placeholderContent: 'Describe your workflow, process steps, or methodology...',
      acceptedFiles: 'image/*',
      maxFiles: 5
    }
  };

  const config = contentTypeConfig[contentType] || contentTypeConfig.post;

  useEffect(() => {
    setPostData(prev => ({ ...prev, contentType }));
  }, [contentType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      // For video content type, allow both video and image files
      if (contentType === 'video') {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          setError('Please select only image or video files');
          return false;
        }
      } else {
        // For other content types, only allow images
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files');
          return false;
        }
      }
      
      // Validate file size (50MB max for videos, 10MB for images)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.slice(0, config.maxFiles - postData.images.length).map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type
    }));
    
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleImageUpload(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (imageId) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', postData.title.trim());
      formData.append('content', postData.content.trim());
      formData.append('content_type', contentType);
      
      // Add image/video if selected
      if (postData.images && postData.images.length > 0) {
        // For now, use the first file as the main media
        formData.append('image', postData.images[0].file);
      }
      
      console.log('Creating post with type:', contentType);
      console.log('Title:', postData.title.trim());
      console.log('Content:', postData.content.trim());
      
      const result = await postsAPI.createPost(formData);
      console.log('Post created successfully:', result);
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setPostData({ title: '', content: '', images: [], contentType: 'post' });
        setSuccess(false);
        navigate('/', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      
      let errorMessage = 'Failed to create post. Please try again.';
      if (error.response?.data?.title) {
        errorMessage = error.response.data.title[0];
      } else if (error.response?.data?.content) {
        errorMessage = error.response.data.content[0];
      } else if (error.response?.data?.image) {
        errorMessage = error.response.data.image[0];
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up image URLs to prevent memory leaks
    postData.images.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
    navigate(-1); // Go back to previous page
  };

  const isFormValid = postData.title.trim() || postData.content.trim() || postData.images.length > 0;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            {config.title.split(' ')[1]} Created Successfully!
          </h2>
          <p className="text-green-700">Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4`}>
              <config.icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600 mt-1">{config.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Type Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Content Type:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${config.color} bg-white border`}>
              {contentType}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="inline w-4 h-4 mr-2" />
              {contentType === 'workflow' ? 'Workflow Name' : 
               contentType === 'story' ? 'Story Title' :
               contentType === 'image' ? 'Image Caption' : 'Title'}
            </label>
            <input
              type="text"
              name="title"
              value={postData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={config.placeholderTitle}
              maxLength={100}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {postData.title.length}/100
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              {contentType === 'workflow' ? 'Process Description' :
               contentType === 'story' ? 'Story Content' :
               contentType === 'image' ? 'Image Description' :
               contentType === 'video' ? 'Video Description' : 'Content'}
            </label>
            <textarea
              name="content"
              value={postData.content}
              onChange={handleInputChange}
              rows={contentType === 'story' ? 8 : 6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={config.placeholderContent}
              maxLength={contentType === 'story' ? 5000 : 2000}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {postData.content.length}/{contentType === 'story' ? 5000 : 2000}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {contentType === 'video' ? (
                <>
                  <Video className="inline w-4 h-4 mr-2" />
                  Media Files (Images & Videos, Max {config.maxFiles})
                </>
              ) : (
                <>
                  <Image className="inline w-4 h-4 mr-2" />
                  Images (Max {config.maxFiles})
                </>
              )}
            </label>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {contentType === 'video' ? (
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-600 mb-2">
                Drag and drop {contentType === 'video' ? 'media files' : 'images'} here, or{' '}
                <label className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">
                  browse
                  <input
                    type="file"
                    multiple
                    accept={config.acceptedFiles}
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={postData.images.length >= config.maxFiles}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">
                {contentType === 'video' 
                  ? 'PNG, JPG, GIF up to 10MB each, MP4, MOV up to 50MB'
                  : 'PNG, JPG, GIF up to 10MB each'
                }
              </p>
            </div>

            {/* File Preview */}
            {postData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {postData.images.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.type.startsWith('video/') ? (
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        controls={false}
                        muted
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(media.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                      {media.type.startsWith('video/') && (
                        <Video className="inline w-3 h-3 mr-1" />
                      )}
                      {media.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {postData.images.length > 0 && (
                <span>
                  {postData.images.length} {contentType === 'video' ? 'media file' : 'image'}
                  {postData.images.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Publishing...' : `Publish ${contentType === 'post' ? 'Post' : contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;