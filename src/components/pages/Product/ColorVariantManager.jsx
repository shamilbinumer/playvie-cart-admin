import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import MultipleImageUpload from "../../layout/MultipleImagesUpload";
import SingleImageUpload from "../../layout/SingleImageUpload";
import Swal from "sweetalert2";
import { useState } from "react";

const ColorVariantManager = ({ 
  variants = [], 
  onVariantsChange, 
  disabled = false,
  errors = {}
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [formKey, setFormKey] = useState(Date.now()); // Add key to force re-render
  const [currentVariant, setCurrentVariant] = useState({
    colorName: "",
    colorCode: "#000000",
    skuCode: "",
    thumbnail: null,
    productImages: [],
    stock: 0,
    isActive: true
  });

  const resetForm = () => {
    setCurrentVariant({
      colorName: "",
      colorCode: "#000000",
      skuCode: "",
      thumbnail: null,
      productImages: [],
      stock: 0,
      isActive: true
    });
    setFormKey(Date.now()); // Force re-render of image components
  };

  const handleAddVariant = () => {
    if (!currentVariant.colorName || !currentVariant.skuCode) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Color name and SKU are required",
      });
      return;
    }

    if (!currentVariant.thumbnail) {
      Swal.fire({
        icon: "warning",
        title: "Missing Thumbnail",
        text: "Thumbnail image is required",
      });
      return;
    }

    // if (!currentVariant.productImages || currentVariant.productImages.length === 0) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Missing Product Images",
    //     text: "At least one product image is required",
    //   });
    //   return;
    // }

    const newVariant = {
      ...currentVariant,
      colorId: `${currentVariant.colorName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
    };

    if (editingIndex !== null) {
      const updated = [...variants];
      updated[editingIndex] = newVariant;
      onVariantsChange(updated);
      setEditingIndex(null);
    } else {
      onVariantsChange([...variants, newVariant]);
    }

    // Reset form with new key
    resetForm();
  };

  const handleEditVariant = (index) => {
    setCurrentVariant(variants[index]);
    setEditingIndex(index);
    setFormKey(Date.now()); // Force re-render with new default images
  };

  const handleDeleteVariant = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this color variant?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#81184e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = variants.filter((_, i) => i !== index);
        onVariantsChange(updated);
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    resetForm();
  };

  const handleThumbnailSelect = (file) => {
    setCurrentVariant(prev => ({ ...prev, thumbnail: file }));
  };

  const handleProductImagesSelect = (files) => {
    setCurrentVariant(prev => ({ ...prev, productImages: files }));
  };

  const removeProductImage = (index) => {
    setCurrentVariant(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {editingIndex !== null ? "Edit Color Variant" : "Add New Color Variant"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentVariant.colorName}
              onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e]"
              placeholder="e.g., Red, Blue, Pink"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentVariant.colorCode}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorCode: e.target.value }))}
                className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                disabled={disabled}
              />
              <input
                type="text"
                value={currentVariant.colorCode}
                onChange={(e) => setCurrentVariant(prev => ({ ...prev, colorCode: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e]"
                placeholder="#000000"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variant SKU Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentVariant.skuCode}
              onChange={(e) => setCurrentVariant(prev => ({ ...prev, skuCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e]"
              placeholder="e.g., KTS001-RED"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={currentVariant.stock}
              onChange={(e) => setCurrentVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e]"
              min="0"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div key={`thumbnail-${formKey}`}>
            <SingleImageUpload
              label={`Thumbnail for ${currentVariant.colorName || 'Variant'}`}
              placeholder="Upload variant thumbnail"
              maxSizeKB={200}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={handleThumbnailSelect}
              onImageRemove={() => setCurrentVariant(prev => ({ ...prev, thumbnail: null }))}
              defaultImage={editingIndex !== null ? currentVariant.thumbnail : null}
              required
              disabled={disabled}
            />
          </div>

          <div key={`images-${formKey}`}>
            <MultipleImageUpload
              label={`Product Images for ${currentVariant.colorName || 'Variant'}`}
              placeholder="Upload variant product images"
              maxSizeKB={500}
              maxImages={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImagesSelect={handleProductImagesSelect}
              onImagesUpdate={handleProductImagesSelect}
              defaultImages={editingIndex !== null ? currentVariant.productImages : []}

              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="variantActive"
            checked={currentVariant.isActive}
            onChange={(e) => setCurrentVariant(prev => ({ ...prev, isActive: e.target.checked }))}
            className="accent-[#81184e]"
            disabled={disabled}
          />
          <label htmlFor="variantActive" className="text-sm">Is Active</label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-4 py-2 bg-[#81184e] text-white rounded-md hover:bg-[#6a1440] flex items-center gap-2 transition-colors"
            disabled={disabled}
          >
            {editingIndex !== null ? (
              <>
                <Check size={16} />
                Update Variant
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Variant
              </>
            )}
          </button>
          
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2 transition-colors"
              disabled={disabled}
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Variants List */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Added Color Variants ({variants.length})</h3>
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="w-12 h-12 rounded-md border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: variant.colorCode }}
                    title={variant.colorCode}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{variant.colorName}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{variant.colorCode}</span>
                      {!variant.isActive && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">SKU: {variant.skuCode}</p>
                    <p className="text-sm text-gray-600">Stock: {variant.stock} units</p>
                  </div>
                  <div className="flex gap-2">
                    {variant.thumbnail && (
                      <img 
                        src={typeof variant.thumbnail === 'string' 
                          ? variant.thumbnail 
                          : URL.createObjectURL(variant.thumbnail)
                        }
                        alt={variant.colorName}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    )}
                    {variant.productImages && variant.productImages.length > 0 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        +{variant.productImages.length} images
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditVariant(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    disabled={disabled}
                    title="Edit variant"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    disabled={disabled}
                    title="Delete variant"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {errors.colorVariants && (
        <p className="text-sm text-red-600 mt-2">{errors.colorVariants}</p>
      )}
    </div>
  );
};

export default ColorVariantManager;