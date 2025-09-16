import React, { useState } from "react";
import FormContainer from "../../layout/FormContainer";
import ColorPickerInput from "../../layout/ColorPickerInput";
import TextInput from "../../layout/TextInput";
import SingleImageUpload from "../../layout/SingleImageUpload";
import BreadCrumb from "../../layout/BreadCrumb";

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    bannerImage: null,
    thumbnailImage: null,
    backgroundColor: "#3498db",
    priority: "",
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
          { label: "Category List", path: "/master/category-list" },
          { label: "Add Category", path: "#" },
        ]}
      />
    <FormContainer
      title="Add Category"
      onCancel={() => console.log("Cancelled")}
      onSubmit={handleSubmit}
      submitText="Create Category"
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
        required
      />
     </div>

    <div>
        {/* Thumbnail Image Upload */}
      <SingleImageUpload
        label="Thumbnail Image"
        placeholder="Upload thumbnail image"
        maxSizeMB={3}
        acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
        onImageSelect={(file) => handleInputChange("thumbnailImage", file)}
        onImageRemove={() => handleInputChange("thumbnailImage", null)}
        required
      />
    </div>
     </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
  <div> {/* Background Color */}
      <ColorPickerInput
        id="background-color"
        name="backgroundColor"
        label="Background Color"
        value={formData.backgroundColor}
        onChange={(color) => handleInputChange("backgroundColor", color)}
        showHex
        rounded
      /></div>
      <div>
         {/* Priority */}
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
</div>
    
    </FormContainer>
   </>
  );
};

export default CategoryForm;
