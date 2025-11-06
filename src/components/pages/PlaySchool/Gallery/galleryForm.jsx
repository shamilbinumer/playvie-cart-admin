import React, { useState, useEffect } from "react";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import SearchableDropdown from "../../../layout/SearchabelDropdown";
import FormContainer from "../../../layout/FormContainer";
import { db } from "../../../../firebase";
import BreadCrumb from "../../../layout/BreadCrumb";
import TextInput from "../../../layout/TextInput";
import SingleImageUpload from "../../../layout/SingleImageUpload";

const PlayschoolGalleryForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    category: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const {galleryId } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(galleryId);

  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env
  const navigate = useNavigate();

  // Load gallery data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.galleryData) {
      const galleryData = location.state.galleryData;
      setFormData({
        title: galleryData.title || "",
        image: galleryData.image || null,
        category: galleryData.category || "",
      });
    } else if (isEditMode && !location.state?.galleryData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a Gallery from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/playschool/galley-list");
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


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Gallery tittle is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.image) newErrors.image = "Gallery image is required";

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

      const imageUrl = await uploadToImgBB(formData.image);
      console.log(imageUrl);
      
      
      if (isEditMode) {
        const docRef = doc(db, "playschoolgalley", galleryId);
        await updateDoc(docRef, {
          id: galleryId,
          category: formData.category,
          image: imageUrl,
          title: formData.title,
        });
        Swal.fire({
          title: "Success!",
          text: "Gallery updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        const docRef = doc(collection(db, "playschoolgalley"));
        await setDoc(docRef, {
          id: docRef.id,
          category: formData.category,
          image: imageUrl,
          title: formData.title,
          createdAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Gallery added successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      }

      navigate("/playschool/galley-list");
    } catch (error) {
      console.error("Error saving gallery:", error);
      Swal.fire("Error!", "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Playschool Website", path: "#" },
          { label: "Gallrey List", path: "/playschool/galley-list" },
          { label: isEditMode ? "Edit Gallery" : "Add Gallery", path: "#" },
        ]}
      />

      <FormContainer
        title={isEditMode ? "Edit Gallery" : "Add Gallery"}
        onCancel={() => navigate("/playschool/galley-list")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : isEditMode ? "Update to Gallery" : "Add to Gallery"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Title"
          placeholder="Enter Title"
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
          error={errors.title}
          required
        />
        <SearchableDropdown
          label="Category"
          placeholder="Select Category"
          options={[ 
            { label: "Learning Fun", value: "Learning Fun" },
            { label: "Play Time", value: "Play Time" },
            { label: "Creative Arts", value: "Creative Arts" },  
            { label: "Outdoor Fun", value: "Outdoor Fun" }, 
          ]}
          value={formData.category}
          onChange={(value) => handleInputChange("category", value)}
          error={errors.category}
          required    
        />
        </div>

        <div>
          <SingleImageUpload
            label="Image"
            placeholder="Upload image"
            maxSizeMB={3}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("image", file)}
            onImageRemove={() => handleInputChange("image", null)}
            error={errors.image}
            required
            defaultImage={formData.image}
          />
        </div>

      </FormContainer>
    </>
  );
};

export default PlayschoolGalleryForm;