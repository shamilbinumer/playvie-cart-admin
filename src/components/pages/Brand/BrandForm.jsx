import React, { useState, useEffect } from "react";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, doc, updateDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Preloader from "../../common/Preloader";

const BrandForm = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(brandId);

  const [formData, setFormData] = useState({
    brandName: "",
    brandLogo: null,
    brandBanner: null,
    description: "",
    priority: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';
  
  // Load brand data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.brandData) {
      const brandData = location.state.brandData;
      setFormData({
        brandName: brandData.brandName || "",
        brandLogo: brandData.brandLogo || null,
        brandBanner: brandData.brandBanner || null,
        description: brandData.description || "",
        priority: brandData.priority || "",
        isActive: brandData.isActive || false,
      });
    } else if (isEditMode && !location.state?.brandData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a brand from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/master/brand-list");
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brandName.trim()) {
      newErrors.brandName = "Brand name is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    // Priority validation
    if (!formData.priority || formData.priority === "") {
      newErrors.priority = "Priority is required";
    } else {
      const priorityNum = parseInt(formData.priority);
      if (isNaN(priorityNum) || priorityNum < 0) {
        newErrors.priority = "Priority must be a valid non-negative number";
      }
    }
    
    // For logo validation
    if (!formData.brandLogo) {
      newErrors.brandLogo = "Brand logo is required";
    } else if (typeof formData.brandLogo === 'string' && formData.brandLogo.trim() === '') {
      newErrors.brandLogo = "Brand logo is required";
    }
    
    // For banner validation
    if (!formData.brandBanner) {
      newErrors.brandBanner = "Brand banner is required";
    } else if (typeof formData.brandBanner === 'string' && formData.brandBanner.trim() === '') {
      newErrors.brandBanner = "Brand banner is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToImgBB = async (file) => {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      if (!data.data?.url) {
        throw new Error("No URL returned from image upload service");
      }

      return data.data.url;
    } catch (error) {
      console.error("ImgBB upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let logoUrl = formData.brandLogo;
      let bannerUrl = formData.brandBanner;

      // Upload new images if they are File or Blob objects (not URLs)
      if (formData.brandLogo instanceof File || formData.brandLogo instanceof Blob) {
        try {
          logoUrl = await uploadToImgBB(formData.brandLogo);
          console.log("Uploaded logo URL:", logoUrl);
        } catch (error) {
          console.error("Error uploading logo:", error);
          throw new Error("Failed to upload brand logo: " + error.message);
        }
      }

      if (formData.brandBanner instanceof File || formData.brandBanner instanceof Blob) {
        try {
          bannerUrl = await uploadToImgBB(formData.brandBanner);
          console.log("Uploaded banner URL:", bannerUrl);
        } catch (error) {
          console.error("Error uploading banner:", error);
          throw new Error("Failed to upload brand banner: " + error.message);
        }
      }

      // Ensure we have valid URLs before saving
      if (!logoUrl || typeof logoUrl !== 'string' || logoUrl.trim() === '') {
        throw new Error(`Invalid brand logo URL`);
      }

      if (!bannerUrl || typeof bannerUrl !== 'string' || bannerUrl.trim() === '') {
        throw new Error(`Invalid brand banner URL`);
      }

      const brandData = {
        brandName: formData.brandName.trim(),
        description: formData.description.trim(),
        priority: parseInt(formData.priority),
        brandLogo: logoUrl,
        brandBanner: bannerUrl,
        isActive: formData.isActive,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing brand
        await updateDoc(doc(db, "brands", brandId), {
          ...brandData,
          id: brandId,
        });

        Swal.fire({
          title: "Success!",
          text: "Brand updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/master/brand-list");
      } else {
        // Create new brand
        const docRef = doc(collection(db, "brands"));

        await setDoc(docRef, {
          ...brandData,
          id: docRef.id, 
          createdAt: new Date(),
        });

        Swal.fire({
          title: "Success!",
          text: "Brand created successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/master/brand-list");
        // Reset form for create mode
        setFormData({
          brandName: "",
          brandLogo: null,
          brandBanner: null,
          description: "",
          priority: "",
          isActive: false,
        });
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save brand",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/master/brand-list");
  };

  if (initialLoading) {
    return (
      <div><Preloader /></div>
    );
  }

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Brand List", path: "/master/brand-list" },
          { label: isEditMode ? "Edit Brand" : "Add Brand", path: "#" },
        ]}
      />
      <FormContainer
        title={isEditMode ? "Edit Brand" : "Add Brand"}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : (isEditMode ? "Update Brand" : "Create Brand")}
      >
        {/* Brand Name */}
        <TextInput
          label="Brand Name"
          placeholder="Enter brand name"
          value={formData.brandName}
          onChange={(value) => handleInputChange("brandName", value)}
          error={errors.brandName}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Logo */}
          <div>
            <SingleImageUpload
              label="Brand Logo"
              placeholder="Upload brand logo"
              maxSizeMB={3}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("brandLogo", file)}
              onImageRemove={() => handleInputChange("brandLogo", null)}
              error={errors.brandLogo}
              required
              defaultImage={formData.brandLogo}
            />
          </div>

          {/* Brand Banner */}
          <div>
            <SingleImageUpload
              label="Brand Banner"
              placeholder="Upload brand banner"
              maxSizeMB={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("brandBanner", file)}
              onImageRemove={() => handleInputChange("brandBanner", null)}
              error={errors.brandBanner}
              required
              defaultImage={formData.brandBanner}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Description */}
          <TextInput
            label="Description"
            placeholder="Enter brand description"
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            error={errors.description}
            required
            multiline
            rows={4}
          />
          {/* Priority Field */}
          <TextInput
            label="Priority"
            placeholder="Enter priority (e.g., 1, 2, 3...)"
            type="number"
            value={formData.priority}
            onChange={(value) => handleInputChange("priority", value)}
            error={errors.priority}
            required
            min="0"
            step="1"
          />
        </div>

        {/* Is Active Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="accent-[#81184e]"
          />
          <label htmlFor="isActive">Is Active</label>
        </div>
      </FormContainer>
    </>
  );
};

export default BrandForm;