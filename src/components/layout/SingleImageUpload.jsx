import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

const SingleImageUpload = ({
  onImageSelect = () => {},
  onImageRemove = () => {},
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  placeholder = 'Click to upload or drag and drop an image here'
}) => {
  const [image, setImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size too large. Maximum size: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const processFile = (file) => {
    setError('');
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clean up previous image URL
    if (image) {
      URL.revokeObjectURL(image.preview);
    }

    const newImage = {
      id: Date.now(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    };

    setImage(newImage);
    onImageSelect(file);
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
    onImageRemove();
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-12 h-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600">{placeholder}</p>
          <p className="text-xs text-gray-500">
            {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview */}
      {image && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Image</h4>
          
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border">
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Remove Button */}
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {/* Image Info */}
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-medium">{image.name}</p>
            <p>{formatFileSize(image.size)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Demo usage
const SingleImageDemo = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Single Image Upload</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <SingleImageUpload
          onImageSelect={(file) => {
            setSelectedFile(file);
            console.log('Image selected:', file);
          }}
          onImageRemove={() => {
            setSelectedFile(null);
            console.log('Image removed');
          }}
          placeholder="Upload your profile picture"
          maxSizeMB={3}
          acceptedTypes={['image/jpeg', 'image/png']}
        />
        
        {selectedFile && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✓ Image ready to upload: {selectedFile.name} 
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleImageDemo;