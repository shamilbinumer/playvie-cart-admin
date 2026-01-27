import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';

const ProductPreview = ({ formData }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Initialize color variant and reset when colorVariants change
  useEffect(() => {
    if (formData.hasColorVariants && formData.colorVariants && formData.colorVariants.length > 0) {
      const defaultVariant = formData.colorVariants.find(v => v.isActive) || formData.colorVariants[0];
      setSelectedColorVariant(defaultVariant);
      setSelectedImage(0); // Reset image selection
    } else {
      setSelectedColorVariant(null);
      setSelectedImage(0);
    }
  }, [formData.colorVariants, formData.hasColorVariants]);

  // Initialize size variant and reset when sizeVariants change
  useEffect(() => {
    if (formData.hasSizeVariants && formData.sizeVariants && formData.sizeVariants.length > 0) {
      const defaultSize = formData.sizeVariants.find(v => v.isActive)?.size || formData.sizeVariants[0]?.size;
      setSelectedSize(defaultSize);
    } else {
      setSelectedSize(null);
    }
  }, [formData.sizeVariants, formData.hasSizeVariants]);

  // Calculate ratings
  const calculateAverageRating = () => {
    const total = (formData.oneRating || 0) + (formData.twoRating || 0) + (formData.threeRating || 0) + 
                  (formData.fourRating || 0) + (formData.fiveRating || 0);
    if (total === 0) return 0;
    const weighted = (1 * (formData.oneRating || 0)) + (2 * (formData.twoRating || 0)) + 
                     (3 * (formData.threeRating || 0)) + (4 * (formData.fourRating || 0)) + 
                     (5 * (formData.fiveRating || 0));
    return (weighted / total).toFixed(1);
  };

  const getTotalReviews = () => {
    return (formData.oneRating || 0) + (formData.twoRating || 0) + (formData.threeRating || 0) + 
           (formData.fourRating || 0) + (formData.fiveRating || 0);
  };

  // Get current data based on selected variant and size
  const getCurrentMRP = () => {
    if (formData.hasSizeVariants && selectedSize && formData.sizeVariants) {
      const sizeVariant = formData.sizeVariants.find(v => v.size === selectedSize);
      if (sizeVariant && sizeVariant.mrp) {
        return sizeVariant.mrp;
      }
    }

    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.mrp || formData.mrp;
    }

    return formData.mrp;
  };

  const getCurrentSalesPrice = () => {
    if (formData.hasSizeVariants && selectedSize && formData.sizeVariants) {
      const sizeVariant = formData.sizeVariants.find(v => v.size === selectedSize);
      if (sizeVariant && sizeVariant.salesPrice) {
        return sizeVariant.salesPrice;
      }
    }

    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.salesPrice || formData.salesPrice;
    }

    return formData.salesPrice;
  };

  const getCurrentStock = () => {
    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.stock || 0;
    }
    return formData.stock || 0;
  };

  const getCurrentSKU = () => {
    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.skuCode;
    }
    return formData.skuCode;
  };

  const getCurrentProductImages = () => {
    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.productImages || [];
    }
    return formData.productImages || [];
  };

  const getCurrentThumbnail = () => {
    if (formData.hasColorVariants && selectedColorVariant) {
      return selectedColorVariant.thumbnail;
    }
    return formData.thumbnail;
  };

  const avgRating = calculateAverageRating();
  const totalReviews = getTotalReviews();

  // Prepare images
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/600x600/e5e7eb/9ca3af?text=No+Image';
    if (typeof image === 'string') return image;
    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    return 'https://via.placeholder.com/600x600/e5e7eb/9ca3af?text=No+Image';
  };

  const thumbnailUrl = getCurrentThumbnail();
  const currentProductImages = getCurrentProductImages();
  const productImageUrls = currentProductImages.map(img => getImageUrl(img));
  
  const finalProductImages = thumbnailUrl 
    ? [getImageUrl(thumbnailUrl), ...productImageUrls.filter(img => img !== getImageUrl(thumbnailUrl))]
    : productImageUrls.length > 0 
    ? productImageUrls 
    : ['https://via.placeholder.com/600x600/e5e7eb/9ca3af?text=No+Image'];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
        <span className="px-3 py-1 bg-[#ac1f67] text-white text-sm rounded-full">Customer View</span>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg relative aspect-square">
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                  <Heart className="w-6 h-6 text-gray-400" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                  <Share2 className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <img
                src={finalProductImages[selectedImage]}
                alt="Product"
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              {selectedImage > 0 && (
                <button
                  onClick={() => setSelectedImage(selectedImage - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {selectedImage < finalProductImages.length - 1 && (
                <button
                  onClick={() => setSelectedImage(selectedImage + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                {selectedImage + 1} / {finalProductImages.length}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-3 overflow-x-auto p-2">
              {finalProductImages.map((image, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedImage === index
                      ? 'ring-4 ring-purple-500 shadow-lg'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {formData.productName || 'Product Name'}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {avgRating > 0 ? `(${avgRating}) • ${totalReviews} reviews` : '(0) • No reviews yet'}
                </span>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{Number(getCurrentSalesPrice()).toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{Number(getCurrentMRP()).toFixed(2)}
                </span>
                {getCurrentMRP() && getCurrentSalesPrice() && (
                  <span className="text-lg font-semibold text-green-600">
                    Save ₹{(Number(getCurrentMRP()) - Number(getCurrentSalesPrice())).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Color Variant Selector */}
            {formData.hasColorVariants && formData.colorVariants && formData.colorVariants.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Color:
                  <span className="font-normal text-gray-600 ml-2">
                    {selectedColorVariant?.colorName}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.colorVariants
                    .filter((v) => v.isActive)
                    .map((variant) => (
                      <button
                        key={variant.colorId}
                        onClick={() => {
                          setSelectedColorVariant(variant);
                          setSelectedImage(0);
                        }}
                        className="relative group"
                        title={`${variant.colorName} - Stock: ${variant.stock}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColorVariant?.colorId === variant.colorId
                            ? "border-[#ac1f67] shadow-lg scale-110 ring-2 ring-[#ac1f67] ring-offset-2"
                            : "border-gray-300 hover:border-gray-400 hover:scale-105"
                            }`}
                          style={{ backgroundColor: variant.colorCode }}
                        >
                          {selectedColorVariant?.colorId === variant.colorId && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                size={14}
                                className="text-white drop-shadow-lg"
                                strokeWidth={3}
                              />
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded z-10">
                          {variant.colorName}
                        </span>
                      </button>
                    ))}
                </div>

                {/* Stock info for selected color */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getCurrentStock() > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${getCurrentStock() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getCurrentStock() > 10
                      ? `${selectedColorVariant?.colorName} - In Stock`
                      : getCurrentStock() >= 5
                        ? `${selectedColorVariant?.colorName} - Few items available`
                        : getCurrentStock() > 0
                          ? `${selectedColorVariant?.colorName} - Only ${getCurrentStock()} left`
                          : `${selectedColorVariant?.colorName} - Out of Stock`}
                  </span>
                </div>
              </div>
            )}

            {/* Size Variant Selector */}
            {formData.hasSizeVariants && formData.sizeVariants && formData.sizeVariants.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Size:
                  <span className="font-normal text-gray-600 ml-2">
                    {selectedSize}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.sizeVariants
                    .filter((v) => v.isActive)
                    .map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(variant.size)}
                        className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                          selectedSize === variant.size
                            ? "border-[#ac1f67] bg-[#ac1f67] text-white shadow-lg"
                            : "border-gray-300 text-gray-900 hover:border-[#ac1f67] hover:bg-gray-50"
                        }`}
                      >
                        <div>{variant.size}</div>
                        {/* Show pricing if available for size variant */}
                        {variant.salesPrice && (
                          <div className={`text-xs mt-1 ${selectedSize === variant.size ? 'text-white' : 'text-[#ac1f67]'}`}>
                            ₹{Number(variant.salesPrice).toFixed(0)}
                            {variant.mrp && (
                              <span className={`ml-1 line-through ${selectedSize === variant.size ? 'text-white/70' : 'text-gray-500'}`}>
                                ₹{Number(variant.mrp).toFixed(0)}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {formData.longDescription || 'Product description will appear here...'}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                SKU: {getCurrentSKU() || 'N/A'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 pb-6 border-b">
              <div className={`w-3 h-3 rounded-full ${getCurrentStock() > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${getCurrentStock() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getCurrentStock() > 10
                  ? "In Stock"
                  : getCurrentStock() >= 5
                  ? "Few items available"
                  : getCurrentStock() > 0
                  ? `Only ${getCurrentStock()} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            {getCurrentStock() > 0 && (
              <div className="flex gap-4 pb-6 border-b">
                <button className="flex-1 bg-white border-2 border-[#3c87c8] text-[#3c87c8] font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="flex-1 bg-[#3c87c8] hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  Buy Now
                </button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck size={24} className="text-[#f3911f] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders ₹50+</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield size={24} className="text-[#f3911f] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Warranty</p>
                  <p className="text-xs text-gray-600">1 year guarantee</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <RotateCcw size={24} className="text-[#f3911f] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-600">30 day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;