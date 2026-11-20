import React, { useState } from "react";
import { Trash2, Plus, Check, X } from "lucide-react";
import SingleImageUpload from "../../layout/SingleImageUpload";
import MultipleImageUpload from "../../layout/MultipleImagesUpload";
import Swal from "sweetalert2";

const SizeVariantManager = ({ variants = [], onVariantsChange, errors, disabled = false }) => {
  const [newSize, setNewSize] = useState("");
  const [newMrp, setNewMrp] = useState("");
  const [newSalesPrice, setNewSalesPrice] = useState("");
  const [newPurchaseRate, setNewPurchaseRate] = useState("");
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newProductImages, setNewProductImages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());

  const handleAddSize = () => {
    if (!newSize.trim()) {
      return;
    }

    // Check for duplicates
    if (variants.some((v) => v.size.trim().toLowerCase() === newSize.trim().toLowerCase())) {
      alert("This size already exists");
      return;
    }

    if (!newThumbnail) {
      Swal.fire({
        icon: "warning",
        title: "Missing Thumbnail",
        text: "Thumbnail image is required for size variant",
      });
      return;
    }

    const newVariant = {
      size: newSize.trim(),
      mrp: newMrp,
      salesPrice: newSalesPrice,
      purchaseRate: newPurchaseRate,
      thumbnail: newThumbnail,
      productImages: newProductImages,
      isActive: true,
    };

    if (editingIndex !== null) {
      const updated = [...variants];
      updated[editingIndex] = newVariant;
      onVariantsChange(updated);
      setEditingIndex(null);
    } else {
      const updatedVariants = [
        ...variants,
        newVariant,
      ];
      onVariantsChange(updatedVariants);
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setNewSize("");
    setNewMrp("");
    setNewSalesPrice("");
    setNewPurchaseRate("");
    setNewThumbnail(null);
    setNewProductImages([]);
    setFormKey(Date.now());
  };

  const handleThumbnailSelect = (file) => {
    setNewThumbnail(file);
  };

  const handleProductImagesSelect = (files) => {
    setNewProductImages(files);
  };

  const handleRemoveSize = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
    if (editingIndex === index) {
      setEditingIndex(null);
      resetForm();
    }
  };

  const handleEditSize = (index) => {
    const variant = variants[index];
    setNewSize(variant.size);
    setNewMrp(variant.mrp || "");
    setNewSalesPrice(variant.salesPrice || "");
    setNewPurchaseRate(variant.purchaseRate || "");
    setNewThumbnail(variant.thumbnail || null);
    setNewProductImages(variant.productImages || []);
    setEditingIndex(index);
    setFormKey(Date.now());
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingIndex(null);
  };

  const handleToggleActive = (index) => {
    const updatedVariants = [...variants];
    updatedVariants[index].isActive = !updatedVariants[index].isActive;
    onVariantsChange(updatedVariants);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {editingIndex !== null ? "Edit Size Variant" : "Add Size Variant"}
      </h3>

      {/* Add Size Input */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Enter size (e.g., S, M, L, 10, 15.5)"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
          <input
            type="number"
            placeholder="MRP"
            value={newMrp}
            onChange={(e) => setNewMrp(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            disabled={disabled}
          />
          <input
            type="number"
            placeholder="Sales Price"
            value={newSalesPrice}
            onChange={(e) => setNewSalesPrice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            disabled={disabled}
          />
          <input
            type="number"
            placeholder="Purchase Rate"
            value={newPurchaseRate}
            onChange={(e) => setNewPurchaseRate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleAddSize}
            disabled={disabled || !newSize.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {editingIndex !== null ? <Check width={18} /> : <Plus width={18} />}
            {editingIndex !== null ? "Update" : "Add"}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={disabled}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <X width={18} />
              Cancel
            </button>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Images for Size: {newSize || "New Size"}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div key={`thumbnail-${formKey}`}>
              <SingleImageUpload
                label="Thumbnail"
                placeholder="Upload size thumbnail"
                maxSizeKB={200}
                acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                onImageSelect={handleThumbnailSelect}
                onImageRemove={() => setNewThumbnail(null)}
                defaultImage={editingIndex !== null ? newThumbnail : null}
                required
                disabled={disabled}
              />
            </div>

            <div key={`images-${formKey}`}>
              <MultipleImageUpload
                label="Product Images"
                placeholder="Upload product images for this size"
                maxSizeKB={500}
                maxImages={5}
                acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
                onImagesSelect={handleProductImagesSelect}
                onImagesUpdate={handleProductImagesSelect}
                defaultImages={editingIndex !== null ? newProductImages : []}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {errors?.sizeVariants && (
        <p className="text-sm text-red-600 mb-4">{errors.sizeVariants}</p>
      )}

      {/* Sizes List */}
      <div className="space-y-2">
        {variants.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No sizes added yet</p>
        ) : (
          variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                {/* Active Checkbox */}
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={() => handleToggleActive(index)}
                  disabled={disabled}
                  className="accent-[#81184e]"
                />

                {/* Size Display */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{variant.size}</p>
                </div>

                {/* Thumbnail and Images Preview */}
                <div className="flex gap-2 items-center">
                  {variant.thumbnail && (
                    <img 
                      src={typeof variant.thumbnail === 'string' 
                        ? variant.thumbnail 
                        : URL.createObjectURL(variant.thumbnail)
                      }
                      alt={`Size ${variant.size}`}
                      className="w-12 h-12 object-cover rounded-md border"
                      title="Size thumbnail"
                    />
                  )}
                  {variant.productImages && variant.productImages.length > 0 && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      +{variant.productImages.length} images
                    </div>
                  )}
                </div>

                {/* Edit Delete Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSize(index)}
                    disabled={disabled}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(index)}
                    disabled={disabled}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 width={18} />
                  </button>
                </div>
              </div>

              {/* Pricing Info */}
              {(variant.mrp || variant.salesPrice || variant.purchaseRate) && (
                <div className="flex gap-4 ml-8 text-sm">
                  {variant.mrp && <p className="text-gray-600">MRP: ₹{parseFloat(variant.mrp).toFixed(2)}</p>}
                  {variant.salesPrice && <p className="text-gray-600">Sales: ₹{parseFloat(variant.salesPrice).toFixed(2)}</p>}
                  {variant.purchaseRate && <p className="text-gray-600">Cost: ₹{parseFloat(variant.purchaseRate).toFixed(2)}</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {variants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total sizes: <span className="font-semibold">{variants.length}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SizeVariantManager;
