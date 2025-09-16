import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Plus } from 'lucide-react';

const MultipleImageUpload = ({
  onImagesSelect = () => {},
  onImagesUpdate = () => {},
  maxSizeMB = 5,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  placeholder = 'Click to upload or drag and drop images here'
}) => {
  const [images, setImages] = useState([]);
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

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    setError('');

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      return;
    }

    const validFiles = [];
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    const newImages = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesSelect(updatedImages.map(img => img.file));
  };

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesUpdate(updatedImages.map(img => img.file));
    setError('');
  };

  const clearAllImages = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
    setImages([]);
    onImagesUpdate([]);
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
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    if (images.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return images.reduce((total, img) => total + img.size, 0);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : images.length >= maxImages 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
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
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {images.length >= maxImages ? (
            <div className="text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Maximum images reached ({maxImages}/{maxImages})</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-500">
                {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} up to {maxSizeMB}MB each
              </p>
              <p className="text-xs text-blue-600">
                {images.length}/{maxImages} images selected
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Images ({images.length}) - Total: {formatFileSize(getTotalSize())}
            </h4>
            <button
              onClick={clearAllImages}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Image Info */}
                <div className="mt-1 text-xs text-gray-500">
                  <p className="truncate font-medium" title={image.name}>
                    {image.name}
                  </p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
            
            {/* Add More Button */}
            {images.length < maxImages && (
              <div 
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                onClick={handleClick}
              >
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Add More</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Demo usage
const MultipleImageDemo = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Multiple Image Upload</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <MultipleImageUpload
          maxImages={8}
          onImagesSelect={(files) => {
            setSelectedFiles(files);
            console.log('Images selected:', files);
          }}
          onImagesUpdate={(files) => {
            setSelectedFiles(files);
            console.log('Images updated:', files);
          }}
          placeholder="Upload images for your gallery"
          maxSizeMB={10}
          acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        />
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✓ {selectedFiles.length} images ready to upload
              ({(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB total)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleImageDemo;