import React, { useState } from "react";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";

const BrandForm = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandLogo: null,
    brandBanner: null,
    description: "",
  });

  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", formData);
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
        submitText="Create Brand"
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
          {/* Brand Logo Upload */}
          <div>
            <SingleImageUpload
              label="Brand Logo"
              placeholder="Upload brand logo"
              maxSizeMB={3}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("brandLogo", file)}
              onImageRemove={() => handleInputChange("brandLogo", null)}
              required
            />
          </div>

          <div>
            {/* Brand Banner Upload */}
            <SingleImageUpload
              label="Brand Banner"
              placeholder="Upload brand banner"
              maxSizeMB={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("brandBanner", file)}
              onImageRemove={() => handleInputChange("brandBanner", null)}
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
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="isActive" />
          <label htmlFor="isActive">Is Active</label>
        </div>
      </FormContainer>
    </>
  );
};

export default BrandForm;