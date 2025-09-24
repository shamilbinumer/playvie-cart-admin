import React, { useState } from "react";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";

const BrandForm = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandLogo: null,
    brandBanner: null,
    description: "",
    isActive: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';

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

      // Upload both images
      const logoUrl = await uploadToImgBB(formData.brandLogo);
      const bannerUrl = await uploadToImgBB(formData.brandBanner);

      // Save to Firestore
      await addDoc(collection(db, "brands"), {
        brandName: formData.brandName,
        description: formData.description,
        brandLogo: logoUrl,
        brandBanner: bannerUrl,
        isActive: formData.isActive,
        createdAt: new Date(),
      });

      Swal.fire({
        title: "Success!",
        text: "Your brand was added successfully.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000, // auto close after 2s
        toast: true, // makes it appear like a toast
       
      });
      setFormData({
        brandName: "",
        brandLogo: null,
        brandBanner: null,
        description: "",
        isActive: false,
      });
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

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Brand List", path: "/master/brand-list" },
          { label: "Add Brand", path: "#" },
        ]}
      />
      <FormContainer
        title="Add Brand"
        onCancel={() => console.log("Cancelled")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : "Create Brand"}
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
