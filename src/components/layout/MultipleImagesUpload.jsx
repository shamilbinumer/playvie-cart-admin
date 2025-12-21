import React, { useState, useRef, useEffect } from "react";
import { Upload, X, AlertCircle, Loader2, Plus } from "lucide-react";
import imageCompression from "browser-image-compression";

const MultipleImageUpload = ({
  label = "Upload Images",
  required = false,
  onImagesSelect = () => {},
  onImagesUpdate = () => {},
  maxSizeKB = 100,
  maxImages = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
  placeholder = "Click to upload or drag and drop images here",
  defaultImages = [],
  disabled = false
}) => {
  const [images, setImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const [loadingIds, setLoadingIds] = useState([]);
  const fileInputRef = useRef(null);

  // ✅ Load default images on mount or update
  useEffect(() => {
    if (defaultImages && defaultImages.length > 0) {
      const loaded = defaultImages.map((img, index) => ({
        id: `default-${index}`,
        file: typeof img === "string" ? null : img, // if existing file object
        preview: typeof img === "string" ? img : URL.createObjectURL(img),
        name: typeof img === "string" ? `image-${index}` : img.name,
        size: typeof img === "string" ? 0 : img.size,
        isDefault: true, // optional marker
      }));
      setImages(loaded);
    }
  }, [defaultImages]);

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid type. Accepted: ${acceptedTypes.join(", ")}`;
    }
    return null;
  };

  const compressFile = async (file) => {
    if (file.size <= maxSizeKB * 1024) return file;
    const options = {
      maxSizeMB: maxSizeKB / 1024,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const processFiles = async (files) => {
    const fileArray = Array.from(files);
    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    const newImages = [];
    for (const file of fileArray) {
      const tempId = Date.now() + Math.random();
      setLoadingIds((prev) => [...prev, tempId]);
      try {
        const compressed = await compressFile(file);
        newImages.push({
          id: tempId,
          file: compressed,
          preview: URL.createObjectURL(compressed),
          name: compressed.name,
          size: compressed.size,
        });
      } catch {
        setError("Error compressing one or more images");
      } finally {
        setLoadingIds((prev) => prev.filter((id) => id !== tempId));
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesSelect(updatedImages.map((img) => img.file).filter(Boolean));
    setError("");
  };

  const removeImage = (imageId) => {
    const imageToRemove = images.find((img) => img.id === imageId);
    if (imageToRemove && !imageToRemove.isDefault)
      URL.revokeObjectURL(imageToRemove.preview);

    const updatedImages = images.filter((img) => img.id !== imageId);
    setImages(updatedImages);
    onImagesUpdate(updatedImages.map((img) => img.file).filter(Boolean));
    setError("");
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) processFiles(e.target.files);
  };

  const handleClick = () => {
    if (images.length < maxImages) fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : images.length >= maxImages
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${error ? "border-red-300 bg-red-50" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length > 0)
            processFiles(e.dataTransfer.files);
        }}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          required={required}
          disabled={images.length >= maxImages||disabled}
        />

        <div className="flex flex-col items-center space-y-1">
          <Upload
            className={`w-8 h-8 ${
              isDragOver ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-xs text-gray-600">{placeholder}</p>
          <p className="text-[11px] text-gray-500">
            JPG, PNG, WEBP • Max {maxSizeKB}KB each
          </p>
          <p className="text-[11px] text-blue-600">
            {images.length}/{maxImages} selected
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-1 flex items-center space-x-1 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-3">
          <div className="flex gap-2 flex-wrap">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square w-20 h-20 rounded-md overflow-hidden bg-gray-100 border">
                  {loadingIds.includes(image.id) ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {!loadingIds.includes(image.id) && (
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {images.length < maxImages && (
              <div
                className="aspect-square w-20 h-20 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
                onClick={handleClick}
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
