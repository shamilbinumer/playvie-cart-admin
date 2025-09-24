import React, { useState } from "react";
import FormContainer from "../../layout/FormContainer";
import ColorPickerInput from "../../layout/ColorPickerInput";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    bannerImage: null,
    thumbnailImage: null,
    backgroundColor: "#3498db",
    priority: "",
    isActive: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env in production
  const navigate=useNavigate();
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

  const handlePriorityChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    handleInputChange("priority", numericValue);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    }
    if (!formData.priority.trim()) {
      newErrors.priority = "Priority is required";
    }
    if (!formData.bannerImage) {
      newErrors.bannerImage = "Banner image is required";
    }
    if (!formData.thumbnailImage) {
      newErrors.thumbnailImage = "Thumbnail image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToImgBB = async (file) => {
    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.data.url;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload images to ImgBB
      const bannerUrl = await uploadToImgBB(formData.bannerImage);
      const thumbnailUrl = await uploadToImgBB(formData.thumbnailImage);

      // Save to Firestore
      await addDoc(collection(db, "categories"), {
        categoryName: formData.categoryName,
        bannerImage: bannerUrl,
        thumbnailImage: thumbnailUrl,
        backgroundColor: formData.backgroundColor,
        priority: formData.priority,
        isActive: formData.isActive,
        createdAt: new Date(),
      });

      Swal.fire({
        title: "Success!",
        text: "Category added successfully.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
      });

      // Reset form
      setFormData({
        categoryName: "",
        bannerImage: null,
        thumbnailImage: null,
        backgroundColor: "#3498db",
        priority: "",
        isActive: false,
      });
      navigate("/master/category-list");
    } catch (error) {
      console.error("Error saving category:", error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Category List", path: "/master/category-list" },
          { label: "Add Category", path: "#" },
        ]}
      />
      <FormContainer
        title="Add Category"
        onCancel={() => console.log("Cancelled")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : "Create Category"}
      >
        {/* Category Name */}
        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          value={formData.categoryName}
          onChange={(value) => handleInputChange("categoryName", value)}
          error={errors.categoryName}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Banner Image Upload */}
          <div>
            <SingleImageUpload
              label="Banner Image"
              placeholder="Upload banner image"
              maxSizeMB={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("bannerImage", file)}
              onImageRemove={() => handleInputChange("bannerImage", null)}
              error={errors.bannerImage}
              required
            />
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <SingleImageUpload
              label="Thumbnail Image"
              placeholder="Upload thumbnail image"
              maxSizeMB={3}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("thumbnailImage", file)}
              onImageRemove={() => handleInputChange("thumbnailImage", null)}
              error={errors.thumbnailImage}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Background Color */}
          <div>
            <ColorPickerInput
              id="background-color"
              name="backgroundColor"
              label="Background Color"
              value={formData.backgroundColor}
              onChange={(color) => handleInputChange("backgroundColor", color)}
              showHex
              rounded
            />
          </div>

          {/* Priority */}
          <div>
            <TextInput
              label="Priority"
              placeholder="Enter priority (numbers only)"
              value={formData.priority}
              onChange={handlePriorityChange}
              error={errors.priority}
              required
              type="text"
            />
          </div>

          {/* Is Active Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
            />
            <label htmlFor="isActive">Is Active</label>
          </div>
        </div>
      </FormContainer>
    </>
  );
};

export default CategoryForm;
