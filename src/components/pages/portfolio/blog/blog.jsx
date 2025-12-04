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


const BlogForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    image: null,
    readTime: "",
    priority: "",
    isActive: true,
  });

  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { blogId } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(blogId);

  const API_KEY = "de98e3de28eb4beeec9706734178ec3a"; // move to .env
  const navigate = useNavigate();

  // Blog categories
  const blogCategories = [
    { value: "Activities", label: "Activities" },
    { value: "Development", label: "Development" },
    { value: "Nutrition", label: "Nutrition" },
    { value: "Music", label: "Music" },
    { value: "Parents Guide", label: "Parents Guide" },
  ];

  // Load blog data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.blogData) {
      const blogData = location.state.blogData;
      setFormData({
        title: blogData.title || "",
        excerpt: blogData.excerpt || "",
        content: blogData.content || "",
        author: blogData.author || "",
        category: blogData.category || "",
        image: blogData.image || null,
        readTime: blogData.readTime || "",
        priority: blogData.priority || "",
        isActive: blogData.isActive ?? true,
      });
    } else if (isEditMode && !location.state?.blogData) {
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a blog post from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/master/blog-list");
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
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.author.trim()) newErrors.author = "Author name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.readTime.trim()) newErrors.readTime = "Read time is required";
    if (!formData.priority.trim()) newErrors.priority = "Priority is required";

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

      const imageUrl = await uploadToImgBB(formData.image);
      
      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        image: imageUrl,
        readTime: formData.readTime,
        priority: formData.priority,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        const docRef = doc(db, "blogs", blogId);
        await updateDoc(docRef, {
          ...blogData,
          id: blogId,
          updatedAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Blog post updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      } else {
        const docRef = doc(collection(db, "blogs"));
        await setDoc(docRef, {
          ...blogData,
          id: docRef.id,
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          createdAt: new Date(),
        });
        Swal.fire({
          title: "Success!",
          text: "Blog post added successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
      }

      navigate("/portfolio/blog/Blog");
    } catch (error) {
      console.error("Error saving blog post:", error);
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
          { label: "Blog List", path: "/master/blog-list" },
          { label: isEditMode ? "Edit Blog" : "Add Blog", path: "#" },
        ]}
      />

      <FormContainer
        title={isEditMode ? "Edit Blog Post" : "Add Blog Post"}
        onCancel={() => navigate("/master/blog-list")}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : isEditMode ? "Update Blog" : "Create Blog"}
      >
        <TextInput
          label="Title"
          placeholder="Enter blog title"
          value={formData.title}
          onChange={(value) => handleInputChange("title", value)}
          error={errors.title}
          required
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter a short excerpt (summary)"
            value={formData.excerpt}
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e] ${
              errors.excerpt ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-500">{errors.excerpt}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter full blog content"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#81184e] ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
            rows="8"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextInput
            label="Author Name"
            placeholder="Enter author name"
            value={formData.author}
            onChange={(value) => handleInputChange("author", value)}
            error={errors.author}
            required
          />

          <SearchableDropdown
            label="Category"
            options={blogCategories}
            value={formData.category}
            onChange={(value) => handleInputChange("category", value)}
            placeholder="Select category"
            error={errors.category}
            required
          />
        </div>

        <div className="mt-4">
          <SingleImageUpload
            label="Featured Image"
            placeholder="Upload blog featured image"
            maxSizeMB={3}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
            onImageSelect={(file) => handleInputChange("image", file)}
            onImageRemove={() => handleInputChange("image", null)}
            error={errors.image}
            required
            defaultImage={formData.image}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextInput
            label="Read Time"
            placeholder="e.g., 5 min read"
            value={formData.readTime}
            onChange={(value) => handleInputChange("readTime", value)}
            error={errors.readTime}
            required
          />

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

export default BlogForm;