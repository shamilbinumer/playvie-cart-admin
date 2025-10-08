import React, { useState, useEffect } from "react";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, addDoc, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import Preloader from "../../common/Preloader";

const BrandForm = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(brandId);

  const [formData, setFormData] = useState({
    brandName: "",
    brandLogo: null,
    brandBanner: null,
    description: "",
    priority: "", // New priority field
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';
  
  // Load existing brand data when in edit mode
  useEffect(() => {
    if (isEditMode && brandId) {
      loadBrandData();
    }
  }, [isEditMode, brandId]);

  const loadBrandData = async () => {
    try {
      setInitialLoading(true);
      const brandDoc = await getDoc(doc(db, "brands", brandId));

      if (brandDoc.exists()) {
        const brandData = brandDoc.data();
        setFormData({
          brandName: brandData.brandName || "",
          brandLogo: brandData.brandLogo || null, // Store URL for existing images
          brandBanner: brandData.brandBanner || null, // Store URL for existing images
          description: brandData.description || "",
          priority: brandData.priority || "", // Load priority value
          isActive: brandData.isActive || false,
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Brand not found.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/master/brand-list");
        });
      }
    } catch (error) {
      console.error("Error loading brand:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to load brand data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setInitialLoading(false);
    }
  };

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
    
    // For logo validation - check if it's a File, Blob, or valid URL string
    if (!formData.brandLogo) {
      newErrors.brandLogo = "Brand logo is required";
    } else if (typeof formData.brandLogo === 'string' && formData.brandLogo.trim() === '') {
      newErrors.brandLogo = "Brand logo is required";
    }
    
    // For banner validation - check if it's a File, Blob, or valid URL string
    if (!formData.brandBanner) {
      newErrors.brandBanner = "Brand banner is required";
    } else if (typeof formData.brandBanner === 'string' && formData.brandBanner.trim() === '') {
      newErrors.brandBanner = "Brand banner is required";
    }

    console.log("Validation results:", {
      formData: {
        brandName: formData.brandName,
        description: formData.description,
        priority: formData.priority,
        brandLogo: formData.brandLogo,
        brandBanner: formData.brandBanner,
        logoType: typeof formData.brandLogo,
        bannerType: typeof formData.brandBanner,
        logoIsFile: formData.brandLogo instanceof File,
        bannerIsFile: formData.brandBanner instanceof File,
        logoIsBlob: formData.brandLogo instanceof Blob,
        bannerIsBlob: formData.brandBanner instanceof Blob
      },
      errors: newErrors
    });

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

      // console.log("Final URLs before validation:", { logoUrl, bannerUrl });

      // Ensure we have valid URLs before saving
      if (!logoUrl || typeof logoUrl !== 'string' || logoUrl.trim() === '') {
        console.error("Invalid logo URL:", logoUrl, typeof logoUrl);
        throw new Error(`Invalid brand logo URL: ${logoUrl}`);
      }

      if (!bannerUrl || typeof bannerUrl !== 'string' || bannerUrl.trim() === '') {
        console.error("Invalid banner URL:", bannerUrl, typeof bannerUrl);
        throw new Error(`Invalid brand banner URL: ${bannerUrl}`);
      }

      const brandData = {
        brandName: formData.brandName.trim(),
        description: formData.description.trim(),
        priority: parseInt(formData.priority), // Convert to number
        brandLogo: logoUrl, // This should always be a string URL
        brandBanner: bannerUrl, // This should always be a string URL
        isActive: formData.isActive,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing brand - include the document ID
        await updateDoc(doc(db, "brands", brandId), {
          ...brandData,
          id: brandId, // Store the document ID in the document itself
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

       
        const docRef= await doc(collection(db, "brands"))

        // Update the document to include its own ID
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

        // Reset form for create mode
        setFormData({
          brandName: "",
          brandLogo: null,
          brandBanner: null,
          description: "",
          priority: "", // Reset priority field
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