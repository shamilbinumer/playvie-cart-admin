import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import TextInput from "../../layout/TextInput";

const SizeVariantManager = ({ variants = [], onVariantsChange, errors, disabled = false }) => {
  const [newSize, setNewSize] = useState("");

  const handleAddSize = () => {
    if (!newSize.trim()) {
      return;
    }

    // Check for duplicates
    if (variants.some((v) => v.size.trim().toLowerCase() === newSize.trim().toLowerCase())) {
      alert("This size already exists");
      return;
    }

    const updatedVariants = [
      ...variants,
      {
        size: newSize.trim(),
        isActive: true,
      },
    ];

    onVariantsChange(updatedVariants);
    setNewSize("");
  };

  const handleRemoveSize = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
  };

  const handleSizeChange = (index, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index].size = value;
    onVariantsChange(updatedVariants);
  };

  const handleToggleActive = (index) => {
    const updatedVariants = [...variants];
    updatedVariants[index].isActive = !updatedVariants[index].isActive;
    onVariantsChange(updatedVariants);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Size Variants</h3>

      {/* Add Size Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter size (e.g., S, M, L, 10, 15.5)"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleAddSize}
          disabled={disabled || !newSize.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus width={18} />
          Add Size
        </button>
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
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Active Checkbox */}
              <input
                type="checkbox"
                checked={variant.isActive}
                onChange={() => handleToggleActive(index)}
                disabled={disabled}
                className="accent-[#81184e]"
              />

              {/* Size Input */}
              <input
                type="text"
                value={variant.size}
                onChange={(e) => handleSizeChange(index, e.target.value)}
                placeholder="Size"
                disabled={disabled}
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveSize(index)}
                disabled={disabled}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 width={18} />
              </button>
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
