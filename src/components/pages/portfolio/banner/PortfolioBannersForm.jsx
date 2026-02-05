import Swal from "sweetalert2";
import BreadCrumb from "../../../layout/BreadCrumb";
import Preloader from "../../../common/Preloader";
import FormContainer from "../../../layout/FormContainer";
import TextInput from "../../../layout/TextInput";
import SingleImageUpload from "../../../layout/SingleImageUpload";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";

const PortfolioBannersForm = () => {
  const { portfolioBannerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(portfolioBannerId);

  const [formData, setFormData] = useState({
    bannerName: "",
    bannerImageWeb: null,
    priority: "",
    isActive: true,
    startDate: null,
    endDate: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';

  // Load portfolio banner data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.portfolioBannerData) {
      const portfolioBannerData = location.state.portfolioBannerData;
      setFormData({
        bannerName: portfolioBannerData.bannerName || "",
        bannerImageWeb: portfolioBannerData.bannerImageWeb || null,
        priority: portfolioBannerData.priority || "",
        isActive: portfolioBannerData.isActive || false,
        id: portfolioBannerData.id || "",
        startDate: portfolioBannerData.startDate || null,
        endDate: portfolioBannerData.endDate || null,
      });
    } else if (isEditMode && !location.state?.portfolioBannerData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a portfolio banner from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/portfolio/Banner/PortfolioBannerList");
      });
    }
  }, [isEditMode, location.state, navigate, portfolioBannerId]);

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

    // Validate banner image (only web image now)
    if (!formData.bannerImageWeb) {
      newErrors.bannerImageWeb = "Web banner image is required";
    } else if (typeof formData.bannerImageWeb === "string" && formData.bannerImageWeb.trim() === "") {
      newErrors.bannerImageWeb = "Web banner image cannot be empty";
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

      // Upload image if needed
      webImageUrl = await uploadIfNeeded(formData.bannerImageWeb);

      // Ensure URL is valid before saving
      if (!webImageUrl || typeof webImageUrl !== "string" || webImageUrl.trim() === "") {
        throw new Error("Invalid banner image URL");
      }

      const portfolioBannerData = {
        bannerName: formData.bannerName.trim(),
        priority: parseInt(formData.priority),
        bannerImageWeb: webImageUrl,
        isActive: formData.isActive,
        startDate: formData.startDate,
        endDate: formData.endDate,
        updatedAt: new Date(),
      };

      if (isEditMode) {
        // Update existing portfolio banner
        await updateDoc(doc(db, "portfolioBanner", portfolioBannerId), {
          ...portfolioBannerData,
          id: portfolioBannerId,
        });

        Swal.fire({
          title: "Success!",
          text: "Portfolio banner updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/portfolio-banners/portfolio-banner-list");
      } else {
        // Create new portfolio banner
        const docRef = doc(collection(db, "portfolioBanner"));

        await setDoc(docRef, {
          ...portfolioBannerData,
          id: docRef.id,
          createdAt: new Date(),
        });

        Swal.fire({
          title: "Success!",
          text: "Portfolio banner created successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate("/portfolio/Banner/PortfolioBannerList");

        // Reset form
        setFormData({
          bannerName: "",
          bannerImageWeb: null,
          priority: "",
          isActive: false,
          startDate: null,
          endDate: null,
        });
      }
    } catch (error) {
      console.error("Error saving portfolio banner:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save portfolio banner",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/portfolio-banners/portfolio-banner-list");
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
          { label: "Portfolio Banners", path: "#" },
          { label: "Portfolio Banner List", path: "/portfolio-banners/portfolio-banner-list" },
          { label: isEditMode ? "Edit Portfolio Banner" : "Add Portfolio Banner", path: "#" },
        ]}
      />
      <FormContainer
        title={isEditMode ? "Edit Portfolio Banner" : "Add Portfolio Banner"}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : (isEditMode ? "Update Portfolio Banner" : "Create Portfolio Banner")}
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

        {/* Banner Image */}
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

export default PortfolioBannersForm;