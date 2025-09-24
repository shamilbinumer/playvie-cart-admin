import React, { useState } from "react";
import BreadCrumb from "../../layout/BreadCrumb";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SearchableDropdown from "../../layout/SearchabelDropdown";
import MultipleImageUpload from "../../layout/MultipleImagesUpload";
import TextArea from "../../layout/TextArea";

const ProductForm = () => {
  const [formData, setFormData] = useState({
    productName: "",
    shortDescription: "",
    longDescription: "",
    mrp: "",
    salesPrice: "",
    categoryId: "",
    brandId: "",
    productImages: [],
  });

  const [errors, setErrors] = useState({});

  // Sample data for dropdowns - replace with your actual data
  const categories = [
    { value: "1", label: "Electronics" },
    { value: "2", label: "Clothing" },
    { value: "3", label: "Books" },
    { value: "4", label: "Home & Garden" },
    { value: "5", label: "Sports & Outdoors" },
  ];

  const brands = [
    { value: "1", label: "Apple" },
    { value: "2", label: "Samsung" },
    { value: "3", label: "Nike" },
    { value: "4", label: "Adidas" },
    { value: "5", label: "Sony" },
  ];

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

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    }
    if (!formData.longDescription.trim()) {
      newErrors.longDescription = "Long description is required";
    }
    if (!formData.mrp.trim()) {
      newErrors.mrp = "MRP is required";
    } else if (isNaN(formData.mrp) || parseFloat(formData.mrp) <= 0) {
      newErrors.mrp = "MRP must be a valid positive number";
    }
    if (!formData.salesPrice.trim()) {
      newErrors.salesPrice = "Sales price is required";
    } else if (isNaN(formData.salesPrice) || parseFloat(formData.salesPrice) <= 0) {
      newErrors.salesPrice = "Sales price must be a valid positive number";
    } else if (parseFloat(formData.salesPrice) > parseFloat(formData.mrp)) {
      newErrors.salesPrice = "Sales price cannot be greater than MRP";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.brandId) {
      newErrors.brandId = "Brand is required";
    }
    if (formData.productImages.length === 0) {
      newErrors.productImages = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Handle form submission here
    }
  };

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Product List", path: "/master/product-list" },
          { label: "Add Product", path: "#" },
        ]}
      />
      <FormContainer
        title="Add Product"
        onCancel={() => console.log("Cancelled")}
        onSubmit={handleSubmit}
        submitText="Create Product"
      >
        {/* Product Name */}
        <TextInput
          label="Product Name"
          placeholder="Enter product name"
          value={formData.productName}
          onChange={(value) => handleInputChange("productName", value)}
          error={errors.productName}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Short Description */}
          <TextArea
            label="Short Description"
            placeholder="Enter short description"
            value={formData.shortDescription}
            onChange={(value) => handleInputChange("shortDescription", value)}
            error={errors.shortDescription}
            required
            multiline
            rows={2}
          />

          {/* Long Description */}
          <TextArea
            label="Long Description"
            placeholder="Enter detailed product description"
            value={formData.longDescription}
            onChange={(value) => handleInputChange("longDescription", value)}
            error={errors.longDescription}
            required
            rows={5}
            maxLength={1000}
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MRP */}
          <TextInput
            label="MRP"
            placeholder="Enter MRP"
            value={formData.mrp}
            onChange={(value) => handleInputChange("mrp", value)}
            error={errors.mrp}
            required
            type="number"
            min="0"
            step="0.01"
          />

          {/* Sales Price */}
          <TextInput
            label="Sales Price"
            placeholder="Enter sales price"
            value={formData.salesPrice}
            onChange={(value) => handleInputChange("salesPrice", value)}
            error={errors.salesPrice}
            required
            type="number"
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <SearchableDropdown
            label="Category"
            options={categories}
            value={formData.categoryId}
            onChange={(value) => handleInputChange("categoryId", value)}
            placeholder="Search and select category"
            error={errors.categoryId}
            required
          />

          {/* Brand Dropdown */}
          <SearchableDropdown
            label="Brand"
            options={brands}
            value={formData.brandId}
            onChange={(value) => handleInputChange("brandId", value)}
            placeholder="Search and select brand"
            error={errors.brandId}
            required
          />
        </div>

        {/* Product Images */}
        <div>
          <MultipleImageUpload
            label="Product Images"
            placeholder="Upload product images"
            maxSizeKB={500}
            maxImages={5}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImagesSelect={(images) => handleInputChange("productImages", images)}
            onImagesUpdate={(images) => handleInputChange("productImages", images)}
            required
          />
          {errors.productImages && (
            <p className="mt-1 text-sm text-red-600">{errors.productImages}</p>
          )}
        </div>
      </FormContainer>
    </>
  );
};

export default ProductForm;