import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const SingleImageUpload = ({
  label = 'Upload Image',
  onImageSelect = () => {},
  onImageRemove = () => {},
  maxSizeKB = 100, // default max size 100KB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  placeholder = 'Click to upload or drag and drop an image here',
  required = false
}) => {
  const [image, setImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
    }
    return null;
  };

  const processFile = async (file) => {
    setError('');
    setLoading(true); // start loader

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    let finalFile = file;

    // Compress if bigger than allowed
    if (file.size > maxSizeKB * 1024) {
      try {
        const options = {
          maxSizeMB: maxSizeKB / 1024, // 0.1 MB for 100KB
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
      } catch (err) {
        setError('Error compressing image');
        setLoading(false);
        return;
      }
    }

    // Clean old preview
    if (image) URL.revokeObjectURL(image.preview);

    const newImage = {
      id: Date.now(),
      file: finalFile,
      preview: URL.createObjectURL(finalFile),
      name: finalFile.name,
      size: finalFile.size,
    };

    setImage(newImage);
    onImageSelect(finalFile);
    setLoading(false); // stop loader
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
    onImageRemove();
    setError('');
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`
          border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-all
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Loader or Upload Icon */}
        <div className="flex flex-col items-center space-y-1">
          {loading ? (
            <Loader2 className="w-8 h-8 text-[#81184e] animate-spin" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-[#81184e]' : 'text-gray-400'}`} />
          )}
          <p className="text-xs text-gray-600">
            {loading ? 'Compressing image...' : placeholder}
          </p>
          {!loading && (
            <p className="text-[11px] text-gray-500">
              JPG, PNG, WEBP • Max {maxSizeKB}KB
            </p>
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

      {/* Image Preview */}
      {image && !loading && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Selected Image</h4>
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-md overflow-hidden bg-gray-100 border">
              <img src={image.preview} alt={image.name} className="w-full h-full object-cover" />
            </div>
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            <p className="font-medium">{image.name}</p>
            <p>{(image.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUpload;
