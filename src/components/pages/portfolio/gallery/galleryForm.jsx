import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db } from "../../../../firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import BreadCrumb from "../../../layout/BreadCrumb";
import FormContainer from "../../../layout/FormContainer";
import TextInput from "../../../layout/TextInput";
import SearchableDropdown from "../../../layout/SearchabelDropdown";
import SingleImageUpload from "../../../layout/SingleImageUpload";


const PortFolioGalleryForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    photo: null,
    priority: "",
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { galleryId } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(galleryId);

  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env
  const navigate = useNavigate();

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = querySnapshot.docs
          .map(doc => ({
            value: doc.id,
            label: doc.data().categoryName,
            isActive: doc.data().isActive,
            priority: doc.data().priority || 0
          }))
          .filter(cat => cat.isActive) // Only show active categories
          .sort((a, b) => a.priority - b.priority);
        
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire("Error!", "Failed to load categories.", "error");
      }
    };

    fetchCategories();
  }, []);

  // Load gallery data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.galleryData) {
      const galleryData = location.state.galleryData;
      setFormData({
        title: galleryData.title || "",
        category: galleryData.category || "",
        photo: galleryData.photo || null,
        priority: galleryData.priority || "",
        isActive: galleryData.isActive ?? true,
      });
    } else if (isEditMode && !location.state?.galleryData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a gallery item from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/portfolio/gallery/galleryForm");
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

  const handlePriorityChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    handleInputChange("priority", numericValue);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.photo) newErrors.photo = "Photo is required";
    if (!formData.priority.trim()) newErrors.priority = "Priority is required";

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

      const photoUrl = await uploadToImgBB(formData.photo);
      console.log(photoUrl);
      
      if (isEditMode) {
        const docRef = doc(db, "gallery", galleryId);
        await updateDoc(docRef, {
          id: galleryId,
          title: formData.title,
          category: formData.category,
          photo: photoUrl,
          priority: formData.priority,
          isActive: formData.isActive,
          updatedAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Gallery item updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        const docRef = doc(collection(db, "gallery"));
        await setDoc(docRef, {
          id: docRef.id,
          title: formData.title,
          category: formData.category,
          photo: photoUrl,
          priority: formData.priority,
          isActive: formData.isActive,
          createdAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Gallery item added successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      }

      navigate("/master/gallery-list");
    } catch (error) {
      console.error("Error saving gallery item:", error);
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
          { label: "Gallery List", path: "/master/gallery-list" },
          { label: isEditMode ? "Edit Gallery" : "Add Gallery", path: "#" },
        ]}
      />

      <FormContainer
        title={isEditMode ? "Edit Gallery" : "Add Gallery"}
        onCancel={() => navigate("/master/gallery-list")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : isEditMode ? "Update Gallery" : "Create Gallery"}
      >
        <TextInput
          label="Title"
          placeholder="Enter gallery title"
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
          error={errors.title}
          required
        />

        <div className="mt-4">
          <SearchableDropdown
            label="Category"
            options={categories}
            value={formData.category}
            onChange={(value) => handleInputChange("category", value)}
            placeholder="Search and select category"
            error={errors.category}
            required
          />
        </div>

        <div className="mt-4">
          <SingleImageUpload
            label="Photo"
            placeholder="Upload gallery photo"
            maxSizeMB={3}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("photo", file)}
            onImageRemove={() => handleInputChange("photo", null)}
            error={errors.photo}
            required
            defaultImage={formData.photo}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextInput
            label="Priority"
            placeholder="Enter priority (numbers only)"
            value={formData.priority}
            onChange={handlePriorityChange}
            error={errors.priority}
            required
            type="text"
          />

          <div className="flex items-center space-x-2 mt-8">
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
        </div>
      </FormContainer>
    </>
  );
};

export default PortFolioGalleryForm;