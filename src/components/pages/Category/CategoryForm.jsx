import React, { useState, useEffect } from "react";
import FormContainer from "../../layout/FormContainer";
import ColorPickerInput from "../../layout/ColorPickerInput";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    bannerImage: null,
    thumbnailImage: null,
    backgroundColor: "#3498db",
    priority: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { categoryId } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(categoryId);

  const API_KEY = "YOUR_IMGBB_API_KEY"; // move to .env
  const navigate = useNavigate();

  // Load category data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.categoryData) {
      const categoryData = location.state.categoryData;
      setFormData({
        categoryName: categoryData.categoryName || "",
        bannerImage: categoryData.bannerImage || null,
        thumbnailImage: categoryData.thumbnailImage || null,
        backgroundColor: categoryData.backgroundColor || "#3498db",
        priority: categoryData.priority || "",
        isActive: categoryData.isActive ?? true,
      });
    } else if (isEditMode && !location.state?.categoryData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a category from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/master/category-list");
      });
    }
  }, [isEditMode, location.state, navigate]);

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

    if (!formData.categoryName.trim()) newErrors.categoryName = "Category name is required";
    if (!formData.priority.trim()) newErrors.priority = "Priority is required";
    if (!formData.bannerImage) newErrors.bannerImage = "Banner image is required";
    if (!formData.thumbnailImage) newErrors.thumbnailImage = "Thumbnail image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload image to imgbb (only if it's a File, not a URL)
  const uploadToImgBB = async (fileOrUrl) => {
    if (!fileOrUrl) return null;

    // If it's already a URL (string), just return it
    if (typeof fileOrUrl === "string") return fileOrUrl;

    try {
      const fd = new FormData();
      fd.append("image", fileOrUrl);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data && data.data && data.data.url) {
        return data.data.url;
      } else {
        console.error("ImgBB upload failed:", data);
        return null;
      }
    } catch (err) {
      console.error("Error uploading to Imgbb:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const bannerUrl = await uploadToImgBB(formData.bannerImage);
      const thumbnailUrl = await uploadToImgBB(formData.thumbnailImage);

      if (isEditMode) {
        const docRef = doc(db, "categories", categoryId);
        await updateDoc(docRef, {
          id: categoryId,
          categoryName: formData.categoryName,
          bannerImage: bannerUrl,
          thumbnailImage: thumbnailUrl,
          backgroundColor: formData.backgroundColor,
          priority: formData.priority,
          isActive: formData.isActive,
          updatedAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Category updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        const docRef = doc(collection(db, "categories"));
        await setDoc(docRef, {
          id: docRef.id,
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
      }

      navigate("/master/category-list");
    } catch (error) {
      console.error("Error saving category:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
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
          { label: isEditMode ? "Edit Category" : "Add Category", path: "#" },
        ]}
      />

      <FormContainer
        title={isEditMode ? "Edit Category" : "Add Category"}
        onCancel={() => navigate("/master/category-list")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
      >
        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          value={formData.categoryName}
          onChange={(value) => handleInputChange("categoryName", value)}
          error={errors.categoryName}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleImageUpload
            label="Banner Image"
            placeholder="Upload banner image"
            maxSizeMB={5}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("bannerImage", file)}
            onImageRemove={() => handleInputChange("bannerImage", null)}
            error={errors.bannerImage}
            required
            defaultImage={formData.bannerImage}
          />

          <SingleImageUpload
            label="Thumbnail Image"
            placeholder="Upload thumbnail image"
            maxSizeMB={3}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("thumbnailImage", file)}
            onImageRemove={() => handleInputChange("thumbnailImage", null)}
            error={errors.thumbnailImage}
            required
            defaultImage={formData.thumbnailImage}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ColorPickerInput
            id="background-color"
            name="backgroundColor"
            label="Background Color"
            value={formData.backgroundColor}
            onChange={(color) => handleInputChange("backgroundColor", color)}
            showHex
            rounded
          />

          <TextInput
            label="Priority"
            placeholder="Enter priority (numbers only)"
            value={formData.priority}
            onChange={handlePriorityChange}
            error={errors.priority}
            required
            type="text"
          />

          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="accent-[#81184e]"
            />
            <label htmlFor="isActive">Is Active</label>
          </div>
        </div>
      </FormContainer>
    </>
  );
};

export default CategoryForm;