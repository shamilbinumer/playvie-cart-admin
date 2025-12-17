import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

const ProductPreview = ({ formData }) => {
  const [selectedImage, setSelectedImage] = useState(0);

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

  const thumbnailUrl = getImageUrl(formData.thumbnail);
  const productImageUrls = (formData.productImages || []).map(img => getImageUrl(img));
  
  const finalProductImages = formData.thumbnail 
    ? [thumbnailUrl, ...productImageUrls.filter(img => img !== thumbnailUrl)]
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
                  ₹{formData.salesPrice ? Number(formData.salesPrice).toFixed(2) : '0.00'}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{formData.mrp ? Number(formData.mrp).toFixed(2) : '0.00'}
                </span>
                {formData.mrp && formData.salesPrice && (
                  <span className="text-lg font-semibold text-green-600">
                    Save ₹{(Number(formData.mrp) - Number(formData.salesPrice)).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {formData.longDescription || 'Product description will appear here...'}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                SKU: {formData.skuCode || 'N/A'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 pb-6 border-b">
              <div className={`w-3 h-3 rounded-full ${(formData.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-medium ${(formData.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(formData.stock || 0) > 10
                  ? "In Stock"
                  : (formData.stock || 0) >= 5
                  ? "Few items available"
                  : (formData.stock || 0) > 0
                  ? `Only ${formData.stock} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            {(formData.stock || 0) > 0 && (
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