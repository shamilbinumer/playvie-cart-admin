import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, setDoc, serverTimestamp, doc, query, where, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../../firebase";
import BreadCrumb from "../../layout/BreadCrumb";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SearchableDropdown from "../../layout/SearchabelDropdown";
import MultipleImageUpload from "../../layout/MultipleImagesUpload";
import SingleImageUpload from "../../layout/SingleImageUpload";
import TextArea from "../../layout/TextArea";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Preloader from "../../common/Preloader";
import BulkProductUpload from "./BulkUpload";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const isEditMode = Boolean(productId);

  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    skuCode: "",
    shortDescription: "",
    longDescription: "",
    mrp: "",
    salesPrice: "",
    purchaseRate: "",
    handlingTime: "",
    categoryId: "",
    brandId: "",
    thumbnail: null,
    productImages: [],
    isActive: true,
    oneRating: 0,
    twoRating: 0,
    threeRating: 0,
    fourRating: 0,
    fiveRating: 0,
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [originalSkuCode, setOriginalSkuCode] = useState("");

  // Load product data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.productData) {
      const productData = location.state.productData;
      console.log("Loaded product data for editing:", productData);
      setFormData({
        productName: productData.productName || "",
        productCode: productData.productCode || "",
        skuCode: productData.skuCode || "",
        shortDescription: productData.shortDescription || "",
        longDescription: productData.longDescription || "",
        mrp: productData.mrp || "",
        salesPrice: productData.salesPrice || "",
        purchaseRate: productData.purchaseRate || "",
        handlingTime: productData.handlingTime || "",
        categoryId: productData.categoryId || "",
        brandId: productData.brandId || "",
        thumbnail: productData.thumbnail || null,
        productImages: productData.productImages || [],
        isActive: productData.isActive ?? true,
        fiveRating: productData.fiveRating || 0,
        fourRating: productData.fourRating || 0,
        threeRating: productData.threeRating || 0,
        twoRating: productData.twoRating || 0,
        oneRating: productData.oneRating || 0,
        id: productData.id || "",
      });
      setOriginalSkuCode(productData.skuCode || "");
    } else if (isEditMode && !location.state?.productData) {
      // If navigated directly to edit URL without state, redirect to list
      Swal.fire({
        title: "Error!",
        text: "Invalid access. Please select a product from the list.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/product-list");
      });
    }
  }, [isEditMode, location.state, navigate, productId]);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs
          .filter((doc) => doc.data().isActive)
          .map((doc) => ({
            value: doc.id,
            label: doc.data().categoryName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands from Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsCollection = collection(db, "brands");
        const brandSnapshot = await getDocs(brandsCollection);
        const brandList = brandSnapshot.docs
          .filter((doc) => doc.data().isActive)
          .map((doc) => ({
            value: doc.id,
            label: doc.data().brandName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setBrands(brandList);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

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

  const API_KEY = 'de98e3de28eb4beeec9706734178ec3a';

  const uploadToImgBB = async (imageFile) => {
    // If it's already a URL (existing image), return it
    if (typeof imageFile === 'string' && imageFile.startsWith('http')) {
      return imageFile;
    }

    // If it's a File or Blob, upload it
    if (imageFile instanceof File || imageFile instanceof Blob) {
      const formData = new FormData();
      formData.append("image", imageFile);

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
        console.error("ImgBB Upload Error:", error);
        throw new Error(`Image upload failed: ${error.message}`);
      }
    }

    throw new Error("Invalid image file");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!formData.productCode.trim()) {
      newErrors.productCode = "Product code is required";
    }
    if (!formData.skuCode.trim()) {
      newErrors.skuCode = "SKU code is required";
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
    if (!formData.purchaseRate.trim()) {
      newErrors.purchaseRate = "Purchase rate is required";
    } else if (isNaN(formData.purchaseRate) || parseFloat(formData.purchaseRate) <= 0) {
      newErrors.purchaseRate = "Purchase rate must be a valid positive number";
    }
    if (!formData.handlingTime.trim()) {
      newErrors.handlingTime = "Handling time is required";
    } else if (isNaN(formData.handlingTime) || parseInt(formData.handlingTime) < 0) {
      newErrors.handlingTime = "Handling time must be a valid number";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.brandId) {
      newErrors.brandId = "Brand is required";
    }
    if (!formData.thumbnail) {
      newErrors.thumbnail = "Thumbnail image is required";
    } else if (typeof formData.thumbnail === 'string' && formData.thumbnail.trim() === '') {
      newErrors.thumbnail = "Thumbnail image is required";
    }
    if (formData.productImages.length === 0) {
      newErrors.productImages = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleBulkUpload = async (products) => {
        try {
          setLoading(true);
          let successCount = 0;
          let errorCount = 0;
          const errors = [];

          for (const product of products) {
            try {
              // Check for duplicate SKU
              const productsRef = collection(db, "products");
              const q = query(productsRef, where("skuCode", "==", product.skuCode));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                errors.push(`SKU ${product.skuCode} already exists`);
                errorCount++;
                continue;
              }

              // Create new product
              const docRef = doc(collection(db, "products"));
              await setDoc(docRef, {
                ...product,
                productId: docRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              successCount++;
            } catch (error) {
              errorCount++;
              errors.push(`Failed to upload ${product.productName}: ${error.message}`);
            }
          }

          // Show results
          Swal.fire({
            title: 'Bulk Upload Complete',
            html: `
        <div>
          <p>Successfully uploaded: ${successCount}</p>
          <p>Failed: ${errorCount}</p>
          ${errors.length > 0 ? `<div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
            <strong>Errors:</strong>
            <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>` : ''}
        </div>
      `,
            icon: successCount > 0 ? 'success' : 'error',
            confirmButtonText: 'OK'
          });

          if (successCount > 0) {
            navigate('/product-list');
          }
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to process bulk upload',
            icon: 'error',
          });
        } finally {
          setLoading(false);
        }
      };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check if SKU already exists (skip if same as original in edit mode)
      if (!isEditMode || formData.skuCode !== originalSkuCode) {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("skuCode", "==", formData.skuCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate SKU!",
            text: "A product with this SKU code already exists. Please use a unique SKU.",
          });
          setLoading(false);
          return;
        }
      }

      // Upload thumbnail (handles both new uploads and existing URLs)
      let thumbnailUrl = formData.thumbnail;
      try {
        thumbnailUrl = await uploadToImgBB(formData.thumbnail);
        if (!thumbnailUrl) throw new Error("Thumbnail upload failed");
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        throw new Error("Failed to upload thumbnail: " + error.message);
      }
    
      // Upload product images
      const productImageUrls = [];
      for (const img of formData.productImages) {
        try {
          const url = await uploadToImgBB(img);
          if (url) productImageUrls.push(url);
        } catch (error) {
          console.error("Error uploading product image:", error);
          throw new Error("Failed to upload product images: " + error.message);
        }
      }

      // Get category & brand names
      const selectedCategory = categories.find((cat) => cat.value === formData.categoryId);
      const selectedBrand = brands.find((br) => br.value === formData.brandId);

      // Prepare product data
      const productData = {
        productName: formData.productName.trim(),
        productCode: formData.productCode.trim(),
        skuCode: formData.skuCode.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        mrp: formData.mrp,
        salesPrice: formData.salesPrice,
        purchaseRate: formData.purchaseRate,
        handlingTime: formData.handlingTime,
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.label || "",
        brandId: formData.brandId,
        brandName: selectedBrand?.label || "",
        thumbnail: thumbnailUrl,
        productImages: productImageUrls,
        isActive: formData.isActive,
        oneRating: formData.oneRating,
        twoRating: formData.twoRating,
        threeRating: formData.threeRating,
        fourRating: formData.fourRating,
        fiveRating: formData.fiveRating,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        // Update existing product
        await updateDoc(doc(db, "products", productId), {
          ...productData,
          productId: productId,
        });

        Swal.fire({
          title: "Success!",
          text: "Product updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        navigate('/product-list');
      } else {
        // Create new product
        const docRef = doc(collection(db, "products"));
        await setDoc(docRef, {
          ...productData,
          productId: docRef.id,
          createdAt: serverTimestamp(),
        });

        Swal.fire({
          title: "Success!",
          text: "Product created successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });

        navigate('/product-list');
        // Reset form for create mode
        setFormData({
          productName: "",
          productCode: "",
          skuCode: "",
          shortDescription: "",
          longDescription: "",
          mrp: "",
          salesPrice: "",
          purchaseRate: "",
          handlingTime: "",
          categoryId: "",
          brandId: "",
          thumbnail: null,
          productImages: [],
          isActive: true,
          oneRating: 0,
          twoRating: 0,
          threeRating: 0,
          fourRating: 0,
          fiveRating: 0,
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save product",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/product-list');
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
          { label: "Master Data", path: "#" },
          { label: "Product List", path: "/master/product-list" },
          { label: isEditMode ? "Edit Product" : "Add Product", path: "#" },
        ]}
      />
      {!isEditMode && (
        <BulkProductUpload
          onUploadComplete={handleBulkUpload}
          categories={categories}
          brands={brands}
        />
      )}
      <FormContainer
        title={isEditMode ? "Edit Product" : "Add Product"}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitText={loading ? "Saving..." : (isEditMode ? "Update Product" : "Create Product")}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            value={formData.productName}
            onChange={(value) => handleInputChange("productName", value)}
            error={errors.productName}
            required
          />
          <TextInput
            label="Product Code"
            placeholder="Enter product code"
            value={formData.productCode}
            onChange={(value) => handleInputChange("productCode", value)}
            error={errors.productCode}
            required
          />
          <TextInput
            label="SKU Code"
            placeholder="Enter SKU code"
            value={formData.skuCode}
            onChange={(value) => handleInputChange("skuCode", value)}
            error={errors.skuCode}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Short Description"
            placeholder="Enter short description"
            value={formData.shortDescription}
            onChange={(value) => handleInputChange("shortDescription", value)}
            error={errors.shortDescription}
            required
            rows={3}
          />
          <TextArea
            label="Long Description"
            placeholder="Enter detailed description"
            value={formData.longDescription}
            onChange={(value) => handleInputChange("longDescription", value)}
            error={errors.longDescription}
            required
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <TextInput
            label="MRP"
            placeholder="MRP"
            value={formData.mrp}
            onChange={(value) => handleInputChange("mrp", value)}
            error={errors.mrp}
            required
            type="number"
            min="0"
            step="0.01"
          />
          <TextInput
            label="Sales Price"
            placeholder="Sales price"
            value={formData.salesPrice}
            onChange={(value) => handleInputChange("salesPrice", value)}
            error={errors.salesPrice}
            required
            type="number"
            min="0"
            step="0.01"
          />
          <TextInput
            label="Purchase Rate"
            placeholder="Purchase rate"
            value={formData.purchaseRate}
            onChange={(value) => handleInputChange("purchaseRate", value)}
            error={errors.purchaseRate}
            required
            type="number"
            min="0"
            step="0.01"
          />
          <TextInput
            label="Handling Time"
            placeholder="Days"
            value={formData.handlingTime}
            onChange={(value) => handleInputChange("handlingTime", value)}
            error={errors.handlingTime}
            required
            type="number"
            min="0"
          />
          <SearchableDropdown
            label="Category"
            options={categories}
            value={formData.categoryId}
            onChange={(value) => handleInputChange("categoryId", value)}
            placeholder="Select category"
            error={errors.categoryId}
            required
          />
          <SearchableDropdown
            label="Brand"
            options={brands}
            value={formData.brandId}
            onChange={(value) => handleInputChange("brandId", value)}
            placeholder="Select brand"
            error={errors.brandId}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SingleImageUpload
              label="Thumbnail"
              placeholder="Upload thumbnail"
              maxSizeKB={200}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImageSelect={(image) => handleInputChange("thumbnail", image)}
              onImageRemove={() => handleInputChange("thumbnail", null)}
              defaultImage={isEditMode ? formData.thumbnail : null}
              required
            />
            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
            )}
          </div>
          <div>
            <MultipleImageUpload
              label="Product Images"
              placeholder="Upload product images"
              maxSizeKB={500}
              maxImages={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              onImagesSelect={(images) => handleInputChange("productImages", images)}
              onImagesUpdate={(images) => handleInputChange("productImages", images)}
              defaultImages={isEditMode ? formData.productImages : []}
              required
            />
            {errors.productImages && (
              <p className="mt-1 text-sm text-red-600">{errors.productImages}</p>
            )}
          </div>
        </div>

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

export default ProductForm;