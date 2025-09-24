import React, { useState, useEffect } from "react";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
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
    isActive: false,
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
    if (!formData.brandLogo) {
      newErrors.brandLogo = "Brand logo is required";
    }
    if (!formData.brandBanner) {
      newErrors.brandBanner = "Brand banner is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.data.url;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let logoUrl = formData.brandLogo;
      let bannerUrl = formData.brandBanner;

      // Upload new images only if they are File objects (not URLs)
      if (formData.brandLogo instanceof File) {
        logoUrl = await uploadToImgBB(formData.brandLogo);
      }

      if (formData.brandBanner instanceof File) {
        bannerUrl = await uploadToImgBB(formData.brandBanner);
      }

      const brandData = {
        brandName: formData.brandName,
        description: formData.description,
        brandLogo: logoUrl,
        brandBanner: bannerUrl,
        isActive: formData.isActive,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing brand
        await updateDoc(doc(db, "brands", brandId), brandData);

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
        await addDoc(collection(db, "brands"), {
          ...brandData,
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
          isActive: false,
        });
      }
    } catch (error) {
      console.error("Error saving brand:", error);
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
              existingImageUrl={typeof formData.brandLogo === 'string' ? formData.brandLogo : null}
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
              existingImageUrl={typeof formData.brandBanner === 'string' ? formData.brandBanner : null}
            />
          </div>
        </div>

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
      </FormContainer>
    </>
  );
};

export default BrandForm;