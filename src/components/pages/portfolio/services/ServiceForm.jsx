import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { db } from "../../../../firebase";
import BreadCrumb from "../../../layout/BreadCrumb";
import FormContainer from "../../../layout/FormContainer";
import TextInput from "../../../layout/TextInput";
import SearchableDropdown from "../../../layout/SearchabelDropdown";
import SingleImageUpload from "../../../layout/SingleImageUpload";


const ServiceForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    icon: "",
    color: "",
    thumbnail: null,
    services: ["", "", "", ""],
    priority: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { serviceId } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(serviceId);

  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env
  const navigate = useNavigate();

  // Icon options
  const iconOptions = [
    { value: "Gamepad2", label: "Toys & Play (Gamepad)" },
    { value: "Building2", label: "Furniture (Building)" },
    { value: "Settings", label: "Development (Settings)" },
    { value: "Heart", label: "Care & Health (Heart)" },
    { value: "Users", label: "Recreational (Users)" },
    { value: "Landmark", label: "Infrastructure (Landmark)" },
  ];

  // Color options
  const colorOptions = [
    { value: "#fd680a", label: "Orange" },
    { value: "#05006d", label: "Dark Blue" },
    { value: "#225304", label: "Dark Green" },
    { value: "#e74c3c", label: "Red" },
    { value: "#3498db", label: "Light Blue" },
    { value: "#9b59b6", label: "Purple" },
  ];

  // Load service data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.serviceData) {
      const serviceData = location.state.serviceData;
      setFormData({
        title: serviceData.title || "",
        icon: serviceData.icon || "",
        color: serviceData.color || "",
        thumbnail: serviceData.thumbnail || null,
        services: serviceData.services || ["", "", "", ""],
        priority: serviceData.priority || "",
        isActive: serviceData.isActive ?? true,
      });
    } else if (isEditMode && !location.state?.serviceData) {
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a service from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/master/service-list");
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

  const handleServiceItemChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = value;
    handleInputChange("services", updatedServices);

    if (errors[`service${index}`]) {
      setErrors((prev) => ({
        ...prev,
        [`service${index}`]: "",
      }));
    }
  };

  const addServiceItem = () => {
    if (formData.services.length < 6) {
      handleInputChange("services", [...formData.services, ""]);
    }
  };

  const removeServiceItem = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      handleInputChange("services", updatedServices);
    }
  };

  const handlePriorityChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    handleInputChange("priority", numericValue);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.icon) newErrors.icon = "Icon is required";
    if (!formData.color) newErrors.color = "Color is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail image is required";
    if (!formData.priority.trim()) newErrors.priority = "Priority is required";

    // Validate service items
    formData.services.forEach((service, index) => {
      if (!service.trim()) {
        newErrors[`service${index}`] = `Service item ${index + 1} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadToImgBB = async (file) => {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: "POST",
        body: formDataUpload,
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

      const imageUrl = await uploadToImgBB(formData.thumbnail);
      
      const serviceData = {
        title: formData.title,
        icon: formData.icon,
        color: formData.color,
        thumbnail: imageUrl,
        services: formData.services.filter(s => s.trim()),
        priority: formData.priority,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        const docRef = doc(db, "services", serviceId);
        await updateDoc(docRef, {
          ...serviceData,
          id: serviceId,
          updatedAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Service updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        const docRef = doc(collection(db, "services"));
        await setDoc(docRef, {
          ...serviceData,
          id: docRef.id,
          createdAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Service added successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      }

      navigate("/portfolio/service/ServiceForm");
    } catch (error) {
      console.error("Error saving service:", error);
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
          { label: "Service List", path: "/master/service-list" },
          { label: isEditMode ? "Edit Service" : "Add Service", path: "#" },
        ]}
      />

      <FormContainer
        title={isEditMode ? "Edit Service" : "Add Service"}
        onCancel={() => navigate("/master/service-list")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : isEditMode ? "Update Service" : "Create Service"}
      >
        <TextInput
          label="Service Title"
          placeholder="e.g., Toys & Play Equipment"
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
          error={errors.title}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SearchableDropdown
            label="Icon"
            options={iconOptions}
            value={formData.icon}
            onChange={(value) => handleInputChange("icon", value)}
            placeholder="Select icon"
            error={errors.icon}
            required
          />

          <SearchableDropdown
            label="Color Theme"
            options={colorOptions}
            value={formData.color}
            onChange={(value) => handleInputChange("color", value)}
            placeholder="Select color"
            error={errors.color}
            required
          />
        </div>

        <div className="mt-4">
          <SingleImageUpload
            label="Thumbnail Image"
            placeholder="Upload service thumbnail image"
            maxSizeMB={3}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("thumbnail", file)}
            onImageRemove={() => handleInputChange("thumbnail", null)}
            error={errors.thumbnail}
            required
            defaultImage={formData.thumbnail}
          />
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Service Items <span className="text-red-500">*</span>
            </label>
            {formData.services.length < 6 && (
              <button
                type="button"
                onClick={addServiceItem}
                className="text-sm text-[#81184e] hover:text-[#5f1039] font-medium"
              >
                + Add Item
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {formData.services.map((service, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Service item ${index + 1}`}
                    value={service}
                    onChange={(e) => handleServiceItemChange(index, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e] ${
                      errors[`service${index}`] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[`service${index}`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`service${index}`]}</p>
                  )}
                </div>
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceItem(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
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

        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="accent-[#81184e]"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Is Active
          </label>
        </div>
      </FormContainer>
    </>
  );
};

export default ServiceForm;