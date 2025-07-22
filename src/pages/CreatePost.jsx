import React, { useState, useEffect } from 'react';
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
  Camera,
  Plus,
  Minus,
  Info
} from 'lucide-react';

const CreatePost = ({ searchParams, postsAPI, useAuth, onNavigate }) => {
  const contentType = searchParams?.get?.('type') || 'post';
  const { user } = useAuth();
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    tags: '',
    location: '',
    meta_description: '',
    story_chapters: 1,
    workflow_steps: [],
    images: [],
    contentType: contentType
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [fileValidationInfo, setFileValidationInfo] = useState(null);

  // Content type configurations with enhanced file validation
  const contentTypeConfig = {
    post: {
      title: 'Create New Post',
      subtitle: 'Share your thoughts with the community',
      icon: FileText,
      color: 'text-blue-600',
      placeholderTitle: 'Give your post a catchy title...',
      placeholderContent: 'Share your thoughts, ideas, or story...',
      acceptedFiles: 'image/*,video/*',
      maxFiles: 5,
      maxImageSize: 10, // MB
      maxVideoSize: 100, // MB
      supportedImageFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      supportedVideoFormats: ['MP4', 'WebM', 'OGG', 'MOV'],
      validation: {
        titleRequired: false,
        contentMinLength: 0,
        mediaRequired: false
      }
    },
    image: {
      title: 'Share Image Content',
      subtitle: 'Upload and share your photos',
      icon: Image,
      color: 'text-green-600',
      placeholderTitle: 'Add a caption for your image...',
      placeholderContent: 'Describe your image or add context...',
      acceptedFiles: 'image/*',
      maxFiles: 10,
      maxImageSize: 10,
      supportedImageFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      validation: {
        titleRequired: true,
        contentMinLength: 0,
        mediaRequired: true,
        mediaType: 'image'
      }
    },
    video: {
      title: 'Share Video Content',
      subtitle: 'Upload and share your videos',
      icon: Video,
      color: 'text-purple-600',
      placeholderTitle: 'Give your video a title...',
      placeholderContent: 'Describe your video content...',
      acceptedFiles: 'video/*,image/*',
      maxFiles: 3,
      maxImageSize: 10,
      maxVideoSize: 100,
      supportedImageFormats: ['JPEG', 'PNG', 'WebP'],
      supportedVideoFormats: ['MP4', 'WebM', 'OGG', 'MOV', 'AVI'],
      validation: {
        titleRequired: false,
        contentMinLength: 0,
        mediaRequired: true,
        mediaType: 'video'
      }
    },
    story: {
      title: 'Create a Story',
      subtitle: 'Tell an engaging story',
      icon: BookOpen,
      color: 'text-orange-600',
      placeholderTitle: 'Your story title...',
      placeholderContent: 'Write your story here. Tell us what happened, what you learned, or what you want to share...',
      acceptedFiles: 'image/*',
      maxFiles: 8,
      maxImageSize: 10,
      supportedImageFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      validation: {
        titleRequired: true,
        contentMinLength: 100,
        mediaRequired: false
      }
    },
    workflow: {
      title: 'Design Workflow',
      subtitle: 'Create and share process workflows',
      icon: Workflow,
      color: 'text-red-600',
      placeholderTitle: 'Workflow name...',
      placeholderContent: 'Describe your workflow, process steps, or methodology...',
      acceptedFiles: 'image/*',
      maxFiles: 5,
      maxImageSize: 10,
      supportedImageFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
      validation: {
        titleRequired: true,
        contentMinLength: 0,
        mediaRequired: false,
        workflowStepsRequired: true
      }
    }
  };

  const config = contentTypeConfig[contentType] || contentTypeConfig.post;

  useEffect(() => {
    setPostData(prev => ({ ...prev, contentType }));
  }, [contentType]);

  // Client-side file validation (mirrors backend validation)
  const validateFile = (file, fileType = 'auto') => {
    const errors = [];
    const warnings = [];
    
    // Detect file type if not specified
    if (fileType === 'auto') {
      fileType = file.type.startsWith('video/') ? 'video' : 'image';
    }
    
    // Size validation
    const maxSize = fileType === 'video' ? config.maxVideoSize : config.maxImageSize;
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSize) {
      errors.push(`File size (${fileSizeMB.toFixed(1)}MB) exceeds ${maxSize}MB limit`);
    } else if (fileSizeMB > maxSize * 0.8) {
      warnings.push(`Large file size (${fileSizeMB.toFixed(1)}MB) may take longer to upload`);
    }
    
    // Format validation
    const supportedFormats = fileType === 'video' 
      ? config.supportedVideoFormats 
      : config.supportedImageFormats;
    
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    const mimeType = file.type.toLowerCase();
    
    let isValidFormat = false;
    
    if (fileType === 'video') {
      isValidFormat = supportedFormats.some(format => 
        mimeType.includes(format.toLowerCase()) || 
        fileExtension === format ||
        (format === 'MOV' && (mimeType.includes('quicktime') || fileExtension === 'MOV'))
      );
    } else {
      isValidFormat = supportedFormats.some(format => 
        mimeType.includes(format.toLowerCase()) || 
        fileExtension === format ||
        (format === 'JPEG' && (fileExtension === 'JPG' || fileExtension === 'JPEG'))
      );
    }
    
    if (!isValidFormat) {
      errors.push(`Unsupported ${fileType} format. Supported: ${supportedFormats.join(', ')}`);
    }
    
    // Dimension warnings for images (client-side estimate)
    if (fileType === 'image' && file.size > 5 * 1024 * 1024) {
      warnings.push('Large images may be automatically compressed');
    }
    
    return { errors, warnings, fileType, sizeMB: fileSizeMB };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (files) => {
    const allWarnings = [];
    const fileValidationResults = [];
    
    const validFiles = Array.from(files).filter((file, index) => {
      const result = validateFile(file, contentType === 'video' ? 'auto' : 'image');
      fileValidationResults.push({ file, ...result });
      
      if (result.errors.length > 0) {
        setError(`File "${file.name}": ${result.errors[0]}`);
        return false;
      }
      
      if (result.warnings.length > 0) {
        allWarnings.push(...result.warnings.map(w => `${file.name}: ${w}`));
      }
      
      return true;
    });

    if (allWarnings.length > 0) {
      setWarnings(allWarnings);
    }

    if (validFiles.length === 0) return;

    const newImages = validFiles.slice(0, config.maxFiles - postData.images.length).map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      sizeMB: (file.size / (1024 * 1024)).toFixed(1)
    }));
    
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Show file info
    setFileValidationInfo({
      totalFiles: validFiles.length,
      totalSize: validFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024),
      types: [...new Set(validFiles.map(f => f.type.split('/')[0]))]
    });
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
      images: prev.images.filter(img => {
        if (img.id === imageId) {
          URL.revokeObjectURL(img.url); // Clean up memory
        }
        return img.id !== imageId;
      })
    }));
    
    // Update file info
    if (postData.images.length <= 1) {
      setFileValidationInfo(null);
    }
  };

  // Workflow steps management
  const addWorkflowStep = () => {
    setPostData(prev => ({
      ...prev,
      workflow_steps: [
        ...prev.workflow_steps,
        { title: '', description: '', order: prev.workflow_steps.length + 1 }
      ]
    }));
  };

  const removeWorkflowStep = (index) => {
    setPostData(prev => ({
      ...prev,
      workflow_steps: prev.workflow_steps.filter((_, i) => i !== index)
    }));
  };

  const updateWorkflowStep = (index, field, value) => {
    setPostData(prev => ({
      ...prev,
      workflow_steps: prev.workflow_steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const validateForm = () => {
    const errors = {};
    const validation = config.validation;

    // Title validation
    if (validation.titleRequired && !postData.title.trim()) {
      errors.title = 'Title is required for this content type';
    }

    // Content validation
    if (validation.contentMinLength > 0 && postData.content.length < validation.contentMinLength) {
      errors.content = `Content must be at least ${validation.contentMinLength} characters`;
    }

    // Media validation
    if (validation.mediaRequired && postData.images.length === 0) {
      errors.media = 'Media file is required for this content type';
    }

    // Workflow steps validation
    if (validation.workflowStepsRequired) {
      if (postData.workflow_steps.length < 2) {
        errors.workflow_steps = 'Workflow must have at least 2 steps';
      } else {
        // Validate each step
        postData.workflow_steps.forEach((step, index) => {
          if (!step.title.trim() || !step.description.trim()) {
            errors.workflow_steps = `Step ${index + 1} must have both title and description`;
          }
        });
      }
    }

    // Tags validation
    if (postData.tags) {
      const tags = postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.length > 10) {
        errors.tags = 'Maximum 10 tags allowed';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setValidationErrors({});
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', postData.title.trim());
      formData.append('content', postData.content.trim());
      formData.append('content_type', contentType);
      
      // Add optional fields
      if (postData.tags) formData.append('tags', postData.tags);
      if (postData.location) formData.append('location', postData.location);
      if (postData.meta_description) formData.append('meta_description', postData.meta_description);
      
      // Content type specific fields
      if (contentType === 'story') {
        formData.append('story_chapters', postData.story_chapters);
      }
      
      if (contentType === 'workflow') {
        formData.append('workflow_steps', JSON.stringify(postData.workflow_steps));
      }
      
      // Add media files
      if (postData.images && postData.images.length > 0) {
        const firstFile = postData.images[0];
        if (firstFile.type.startsWith('video/')) {
          formData.append('video', firstFile.file);
        } else {
          formData.append('image', firstFile.file);
        }
      }
      
      console.log('Creating post with content type:', contentType);
      
      const result = await postsAPI.createPost(formData);
      console.log('Post created successfully:', result);
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setPostData({ 
          title: '', 
          content: '', 
          tags: '',
          location: '',
          meta_description: '',
          story_chapters: 1,
          workflow_steps: [],
          images: [], 
          contentType: 'post' 
        });
        setSuccess(false);
        if (onNavigate) {
          onNavigate('/', { replace: true });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      
      if (error.response?.data) {
        // Handle Django validation errors
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          setValidationErrors(backendErrors);
          
          // Create a user-friendly summary error message
          const errorMessages = Object.entries(backendErrors).map(([field, errors]) => {
            const errorList = Array.isArray(errors) ? errors : [errors];
            return `${field}: ${errorList[0]}`;
          });
          
          setError(errorMessages[0] || 'Please fix the errors below');
        } else {
          setError(backendErrors || 'Failed to create post');
        }
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up image URLs to prevent memory leaks
    postData.images.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
    if (onNavigate) {
      onNavigate(-1);
    }
  };

  const isFormValid = () => {
    const validation = config.validation;
    
    // Check required fields
    if (validation.titleRequired && !postData.title.trim()) return false;
    if (validation.contentMinLength > 0 && postData.content.length < validation.contentMinLength) return false;
    if (validation.mediaRequired && postData.images.length === 0) return false;
    if (validation.workflowStepsRequired && postData.workflow_steps.length < 2) return false;
    
    // At least some content is required
    return postData.title.trim() || postData.content.trim() || postData.images.length > 0 || postData.workflow_steps.length > 0;
  };

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

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-red-700 text-sm font-medium">Error creating post</span>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Warnings Alert */}
        {warnings.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-yellow-700 text-sm font-medium">Warnings</span>
                <ul className="text-yellow-600 text-sm mt-1 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
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
              {config.validation.titleRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name="title"
              value={postData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={config.placeholderTitle}
              maxLength={200}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
            <div className="text-right text-sm text-gray-400 mt-1">
              {postData.title.length}/200
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
              {config.validation.contentMinLength > 0 && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name="content"
              value={postData.content}
              onChange={handleInputChange}
              rows={contentType === 'story' ? 8 : 6}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                validationErrors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={config.placeholderContent}
              maxLength={contentType === 'story' ? 10000 : 2000}
            />
            {validationErrors.content && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
            )}
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>
                {config.validation.contentMinLength > 0 && 
                  `Minimum ${config.validation.contentMinLength} characters`
                }
              </span>
              <span>{postData.content.length}/{contentType === 'story' ? 10000 : 2000}</span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {contentType === 'video' ? (
                <>
                  <Video className="inline w-4 h-4 mr-2" />
                  Media Files (Images & Videos, Max {config.maxFiles})
                  {config.validation.mediaRequired && <span className="text-red-500 ml-1">*</span>}
                </>
              ) : (
                <>
                  <Image className="inline w-4 h-4 mr-2" />
                  Images (Max {config.maxFiles})
                  {config.validation.mediaRequired && <span className="text-red-500 ml-1">*</span>}
                </>
              )}
            </label>
            
            {/* File Requirements Info */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>File Requirements:</strong>
                <ul className="mt-1 space-y-1">
                  {config.supportedImageFormats && (
                    <li>• Images: {config.supportedImageFormats.join(', ')} (Max {config.maxImageSize}MB)</li>
                  )}
                  {config.supportedVideoFormats && (
                    <li>• Videos: {config.supportedVideoFormats.join(', ')} (Max {config.maxVideoSize}MB)</li>
                  )}
                  <li>• Maximum {config.maxFiles} files total</li>
                </ul>
              </div>
            </div>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : validationErrors.media ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
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
              <p className="text-sm text-gray-500">
                {contentType === 'video' 
                  ? `Images up to ${config.maxImageSize}MB, Videos up to ${config.maxVideoSize}MB`
                  : `${config.supportedImageFormats.join(', ')} up to ${config.maxImageSize}MB each`
                }
              </p>
            </div>

            {validationErrors.media && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.media}</p>
            )}

            {/* File Validation Info */}
            {fileValidationInfo && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ {fileValidationInfo.totalFiles} file(s) ready to upload 
                  ({fileValidationInfo.totalSize.toFixed(1)}MB total)
                </p>
              </div>
            )}

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
                      {media.name} ({media.sizeMB}MB)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={postData.tags}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.tags ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="technology, tutorial, programming"
              maxLength={500}
            />
            {validationErrors.tags && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.tags}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Maximum 10 tags, each up to 50 characters</p>
          </div>

          {/* Story Chapters (Story content only) */}
          {contentType === 'story' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Chapters
              </label>
              <input
                type="number"
                name="story_chapters"
                value={postData.story_chapters}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Workflow Steps (Workflow content only) */}
          {contentType === 'workflow' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow Steps <span className="text-red-500">*</span>
              </label>
              
              {postData.workflow_steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                    {postData.workflow_steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkflowStep(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Step title"
                      value={step.title}
                      onChange={(e) => updateWorkflowStep(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      maxLength={100}
                    />
                    <textarea
                      placeholder="Step description"
                      value={step.description}
                      onChange={(e) => updateWorkflowStep(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addWorkflowStep}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </button>
              
              {validationErrors.workflow_steps && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.workflow_steps}</p>
              )}
            </div>
          )}

          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <input
                type="text"
                name="location"
                value={postData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New York, NY"
                maxLength={200}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (optional)
              </label>
              <input
                type="text"
                name="meta_description"
                value={postData.meta_description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for SEO"
                maxLength={160}
              />
            </div>
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
                disabled={!isFormValid() || isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFormValid() && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  `Publish ${contentType === 'post' ? 'Post' : contentType.charAt(0).toUpperCase() + contentType.slice(1)}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;