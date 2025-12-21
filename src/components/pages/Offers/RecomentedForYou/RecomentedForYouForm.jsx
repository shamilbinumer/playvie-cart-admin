import { Loader2 } from "lucide-react";
import TextInput from "../../../layout/TextInput";
import ProductDropdown from "../../../layout/ProductDropdown";
import SingleImageUpload from "../../../layout/SingleImageUpload";
import BreadCrumb from "../../../layout/BreadCrumb";
import { PageHeader } from "../../../common/PageHeader";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useState, useEffect } from "react";
import FormContainer from "../../../layout/FormContainer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

const RecommendedForYouForm = () => {
  const { recomentedForYouId } = useParams();
  const isEditMode = Boolean(recomentedForYouId);
  const location = useLocation();
  const recomentedData = location.state?.recomentedData;
  
  const [formData, setFormData] = useState({
    bannerImage: null,
    productIds: [],
    active: true,
    priority: ''
  });
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && recomentedData) {
      setFormData({
        bannerImage: null, // Will keep as null, use existing URL
        productIds: recomentedData.productIds || [],
        active: recomentedData.active ?? true,
        priority: recomentedData.priority?.toString() || ''
      });
      setExistingImageUrl(recomentedData.bannerImageUrl);
    }
  }, [isEditMode, recomentedData]);

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      throw error;
    }
  };

  const handleImageSelect = (file) => {
    setFormData(prev => ({ ...prev, bannerImage: file }));
    setExistingImageUrl(null); // Clear existing URL when new image is selected
    setErrors(prev => ({ ...prev, bannerImage: '' }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, bannerImage: null }));
    setExistingImageUrl(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // In edit mode, allow existing image. In create mode, require new image
    if (!formData.bannerImage && !existingImageUrl) {
      newErrors.bannerImage = 'Banner image is required';
    }

    if (formData.productIds.length === 0) {
      newErrors.productIds = 'Please select at least one product';
    }

    if (!formData.priority || formData.priority < 1) {
      newErrors.priority = 'Priority must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = existingImageUrl;

      // Only upload new image if one was selected
      if (formData.bannerImage) {
        setUploading(true);
        imageUrl = await uploadToImgBB(formData.bannerImage);
        setUploading(false);
      }

      if (isEditMode) {
        // Update existing document
        const docRef = doc(db, "recommendedForYou", recomentedForYouId);
        await updateDoc(docRef, {
          bannerImageUrl: imageUrl,
          productIds: formData.productIds,
          active: formData.active,
          priority: parseInt(formData.priority),
          updatedAt: new Date().toISOString()
        });

        Swal.fire({
          title: "Success!",
          text: "Recommended For You updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        // Create new document
        const docRef = doc(collection(db, "recommendedForYou"));
        await setDoc(docRef, {
          id: docRef.id,
          bannerImageUrl: imageUrl,
          productIds: formData.productIds,
          active: formData.active,
          priority: parseInt(formData.priority),
          createdAt: new Date().toISOString()
        });

        Swal.fire({
          title: "Success!",
          text: "Recommended For You created successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      }

      setFormData({
        bannerImage: null,
        productIds: [],
        active: true,
        priority: ''
      });
      navigate("/offers/recommended-for-you");
    } catch (error) {
      console.error('Error submitting:', error);
      Swal.fire({
        title: "Error!",
        text: "Error submitting. Please try again.",
        icon: "error",
        showConfirmButton: true,
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="">
      <BreadCrumb items={[
        { label: "Recommended For You", path: "/offers/recommended-for-you" },
        { label: isEditMode ? "Edit Recommended For You" : "Add Recommended For You", path: "#" },
      ]} />

      <FormContainer
        title={isEditMode ? "Edit Recommended For You" : "Add Recommended For You"}
        onCancel={() => navigate("/offers/recommended-for-you")}
        onSubmit={handleSubmit}
        cancelText={"Cancel"}
        submitText={submitting ? "Saving..." : isEditMode ? "Update" : "Save"}
        disabled={submitting || uploading}
      >
        <div className="space-y-6 bg-white rounded-lg shadow">
          <SingleImageUpload
            label="Banner Image"
            required
            placeholder="Upload banner image"
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            error={errors.bannerImage}
            maxSizeKB={200}
            defaultImage={existingImageUrl}
          />

          <ProductDropdown
            label="Select Products"
            required
            value={formData.productIds}
            onChange={(value) => setFormData(prev => ({ ...prev, productIds: value }))}
            error={errors.productIds}
          />

          <TextInput
            label="Priority"
            type="number"
            min="1"
            required
            placeholder="Enter priority (higher number = higher priority)"
            value={formData.priority}
            onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            error={errors.priority}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (Display this recommendation to users)
            </label>
          </div>
        </div>
      </FormContainer>
    </div>
  );
};

export default RecommendedForYouForm;