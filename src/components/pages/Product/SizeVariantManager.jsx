import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import TextInput from "../../layout/TextInput";

const SizeVariantManager = ({ variants = [], onVariantsChange, errors, disabled = false }) => {
  const [newSize, setNewSize] = useState("");
  const [newMrp, setNewMrp] = useState("");
  const [newSalesPrice, setNewSalesPrice] = useState("");
  const [newPurchaseRate, setNewPurchaseRate] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddSize = () => {
    if (!newSize.trim()) {
      return;
    }

    // Check for duplicates
    if (variants.some((v) => v.size.trim().toLowerCase() === newSize.trim().toLowerCase())) {
      alert("This size already exists");
      return;
    }

    const newVariant = {
      size: newSize.trim(),
      mrp: newMrp,
      salesPrice: newSalesPrice,
      purchaseRate: newPurchaseRate,
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
    setNewSize("");
    setNewMrp("");
    setNewSalesPrice("");
    setNewPurchaseRate("");
  };

  const handleRemoveSize = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewSize("");
      setNewMrp("");
      setNewSalesPrice("");
      setNewPurchaseRate("");
    }
  };

  const handleEditSize = (index) => {
    const variant = variants[index];
    setNewSize(variant.size);
    setNewMrp(variant.mrp || "");
    setNewSalesPrice(variant.salesPrice || "");
    setNewPurchaseRate(variant.purchaseRate || "");
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewSize("");
    setNewMrp("");
    setNewSalesPrice("");
    setNewPurchaseRate("");
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
            <Plus width={18} />
            {editingIndex !== null ? "Update" : "Add"}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={disabled}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
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
