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

const BannersForm = () => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(bannerId);

  const [formData, setFormData] = useState({
    bannerName: "",
    bannerImageWeb: null,
    bannerImageMobile: null,
    priority: "",
    isActive: true,
    startDate: null,
    endDate: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';

  // Load banner data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.bannerData) {
      const bannerData = location.state.bannerData;
      setFormData({
        bannerName: bannerData.bannerName || "",
        bannerImageMobile: bannerData.bannerImageMobile || null,
        bannerImageWeb: bannerData.bannerImageWeb || null,
        priority: bannerData.priority || "",
        isActive: bannerData.isActive || false,
        id: bannerData.id || "",
        startDate: bannerData.startDate || null,
        endDate: bannerData.endDate || null,
      });
    } else if (isEditMode && !location.state?.bannerData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a banner from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/banners/banner-list");
      });
    }
  }, [isEditMode, location.state, navigate, bannerId]);

  // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for input display
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length <= 2) {
      // It's in DD-MM-YYYY format
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  // Helper function to convert DD-MM-YYYY to Date object for comparison
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length <= 2) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
    return null;
  };

  /// image ratio validation
  const validateImageDimensions = (imageFile, minWidth, minHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.src = typeof imageFile === "string" ? imageFile : URL.createObjectURL(imageFile);
    });
  };


  const handleInputChange = async (field, value) => {
 
    // Convert date from input format (YYYY-MM-DD) to storage format (DD-MM-YYYY)
    if (field === "startDate" || field === "endDate") {
      if (value && value.includes("-")) {
        const parts = value.split("-");
        // If it's in YYYY-MM-DD format (from input)
        if (parts[0].length === 4) {
          const [year, month, day] = parts;
          value = `${day}-${month}-${year}`;
        }
      }
    }

    console.log(field, value);

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

    if (!formData.bannerName.trim()) {
      newErrors.bannerName = "Banner name is required";
    }

    // Validate banner images
    if (!formData.bannerImageWeb || !formData.bannerImageMobile) {
      if (!formData.bannerImageWeb) {
        newErrors.bannerImageWeb = "Web banner image is required";
      }
      if (!formData.bannerImageMobile) {
        newErrors.bannerImageMobile = "Mobile banner image is required";
      }
    } else {
      // Extra checks for empty strings or invalid data
      if (typeof formData.bannerImageWeb === "string" && formData.bannerImageWeb.trim() === "") {
        newErrors.bannerImageWeb = "Web banner image cannot be empty";
      }
      if (typeof formData.bannerImageMobile === "string" && formData.bannerImageMobile.trim() === "") {
        newErrors.bannerImageMobile = "Mobile banner image cannot be empty";
      }
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

    // Start date validation
    if (!formData.startDate || formData.startDate === "") {
      newErrors.startDate = "Start date is required";
    }

    // End date validation
    if (!formData.endDate || formData.endDate === "") {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate) {
      // Check if end date is before start date
      const startDate = parseDateString(formData.startDate);
      const endDate = parseDateString(formData.endDate);

      if (startDate && endDate && endDate < startDate) {
        newErrors.endDate = "End date must be after or equal to start date";
      }
    }

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
    console.log(errors);

    try {
      console.log("Submitting form with data:", formData);
      if (!validateForm()) return;
      console.log("Form is valid, proceeding...");
      setLoading(true);

      let webImageUrl = formData.bannerImageWeb;
      let mobileImageUrl = formData.bannerImageMobile;

      // Helper: upload if it's a new File/Blob
      const uploadIfNeeded = async (image) => {
        if (image instanceof File || image instanceof Blob) {
          try {
            return await uploadToImgBB(image);
          } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image: " + error.message);
          }
        }
        return image; // already a URL
      };

      // Upload both images if needed
      webImageUrl = await uploadIfNeeded(formData.bannerImageWeb);
      mobileImageUrl = await uploadIfNeeded(formData.bannerImageMobile);

      // Ensure both URLs are valid before saving
      if (
        !webImageUrl ||
        typeof webImageUrl !== "string" ||
        webImageUrl.trim() === "" ||
        !mobileImageUrl ||
        typeof mobileImageUrl !== "string" ||
        mobileImageUrl.trim() === ""
      ) {
        throw new Error("Invalid banner image URLs");
      }

      const bannerData = {
        bannerName: formData.bannerName.trim(),
        priority: parseInt(formData.priority),
        bannerImageWeb: webImageUrl,
        bannerImageMobile: mobileImageUrl,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing banner
        await updateDoc(doc(db, "banners", bannerId), {
          ...bannerData,
          id: bannerId,
        });

        Swal.fire({
          title: "Success!",
          text: "Banner updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/banners/banner-list");
      } else {
        // Create new banner
        const docRef = doc(collection(db, "banners"));

        await setDoc(docRef, {
          ...bannerData,
          id: docRef.id,
          createdAt: new Date(),
        });

        Swal.fire({
          title: "Success!",
          text: "Banner created successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/banners/banner-list");

        // Reset form
        setFormData({
          bannerName: "",
          bannerImageWeb: null,
          bannerImageMobile: null,
          priority: "",
          isActive: false,
          startDate: null,
          endDate: null,
        });
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save banner",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    navigate("/banners/banner-list");
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
          { label: "Banners", path: "#" },
          { label: "Banner List", path: "/banners/banner-list" },
          { label: isEditMode ? "Edit Banner" : "Add Banner", path: "#" },
        ]}
      />
      <FormContainer
        title={isEditMode ? "Edit Banner" : "Add Banner"}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : (isEditMode ? "Update Banner" : "Create Banner")}
      >
        {/* Banner Name */}
        <TextInput
          label="Banner Name"
          placeholder="Enter banner name"
          value={formData.bannerName}
          onChange={(value) => handleInputChange("bannerName", value)}
          error={errors.bannerName}
          required
        />

        {/* Banner Image and priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SingleImageUpload
              label="Banner Image Web"
              placeholder="Upload banner image for web (min 1200x400px)"
              maxSizeKB={500}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(file) => handleInputChange("bannerImageWeb", file)}
              onImageRemove={() => handleInputChange("bannerImageWeb", null)}
              error={errors.bannerImageWeb}
              required
              defaultImage={formData.bannerImageWeb}
              // dimentionValidation={{ width: 1200, height: 400 }}
              exactDimensions={true}
            />
          </div>
          <div>
            <SingleImageUpload
              label="Banner Image Mobile"
              placeholder="Upload banner image mobile (min 600x800px)"
              maxSizeKB={500}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
             onImageSelect={(file) => handleInputChange("bannerImageMobile", file)}
              onImageRemove={() => handleInputChange("bannerImageMobile", null)}
              error={errors.bannerImageMobile}
              required
              defaultImage={formData.bannerImageMobile}
              // dimentionValidation={{ width: 600, height: 800 }}
              exactDimensions={true}
            />
          </div>
        </div>

        {/* Date fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          />
          <TextInput
            label="Start Date"
            placeholder="Enter Date (e.g., DD/MM/YYYY)"
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={(value) => handleInputChange("startDate", value)}
            error={errors.startDate}
            required
          />
          <TextInput
            label="End Date"
            placeholder="Enter Date (e.g., DD/MM/YYYY)"
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={(value) => handleInputChange("endDate", value)}
            error={errors.endDate}
            required
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

export default BannersForm;