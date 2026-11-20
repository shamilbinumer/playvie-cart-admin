import React, { useState, useEffect } from "react";
import TextInput from "../../layout/TextInput";
import TextArea from "../../layout/TextArea";
import { db } from "../../../firebase";
import { collection, doc, updateDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { X } from "lucide-react";

const SizeUnitFormModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const isEditMode = Boolean(editData);

  const [formData, setFormData] = useState({
    unitName: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        unitName: editData.unitName || "",
        description: editData.description || "",
      });
    } else {
      setFormData({
        unitName: "",
        description: "",
      });
    }
    setErrors({});
  }, [isEditMode, editData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.unitName.trim()) {
      newErrors.unitName = "Unit name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        // Update existing size unit
        const docRef = doc(db, "size-unit-master", editData.id);
        await updateDoc(docRef, {
          unitName: formData.unitName.trim(),
          description: formData.description.trim(),
        });

        Swal.fire("Success!", "Size unit updated successfully.", "success");
      } else {
        // Add new size unit
        const newId = doc(collection(db, "size-unit-master")).id;
        await setDoc(doc(db, "size-unit-master", newId), {
          unitId: newId,
          unitName: formData.unitName.trim(),
          description: formData.description.trim(),
          createdAt: new Date(),
        });

        Swal.fire("Success!", "Size unit added successfully.", "success");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving size unit: ", error);
      Swal.fire("Error!", "Failed to save size unit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000082] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Size Unit" : "Add Size Unit"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X width={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <TextInput
            label="Unit Name"
            placeholder="Enter unit name (e.g., cm, inch, kg)"
            value={formData.unitName}
            onChange={(value) => handleInputChange("unitName", value)}
            error={errors.unitName}
            required
          />

          <TextArea
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            error={errors.description}
            rows={3}
            required
          />

          {/* Modal Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SizeUnitFormModal;
