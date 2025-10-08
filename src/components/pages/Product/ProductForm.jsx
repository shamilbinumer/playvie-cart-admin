import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, setDoc, serverTimestamp, doc, query, where, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "../../../firebase";
import BreadCrumb from "../../layout/BreadCrumb";
import FormContainer from "../../layout/FormContainer";
import TextInput from "../../layout/TextInput";
import SearchableDropdown from "../../layout/SearchabelDropdown";
import MultipleImageUpload from "../../layout/MultipleImagesUpload";
import SingleImageUpload from "../../layout/SingleImageUpload";
import TextArea from "../../layout/TextArea";
import { useNavigate, useParams } from "react-router-dom";

const ProductForm = () => {
  const navigate = useNavigate();
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
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalSkuCode, setOriginalSkuCode] = useState("");

  // Fetch product data in edit mode
  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          setFormData({
            productName: data.productName || "",
            productCode: data.productCode || "",
            skuCode: data.skuCode || "",
            shortDescription: data.shortDescription || "",
            longDescription: data.longDescription || "",
            mrp: data.mrp || "",
            salesPrice: data.salesPrice || "",
            purchaseRate: data.purchaseRate || "",
            handlingTime: data.handlingTime || "",
            categoryId: data.categoryId || "",
            brandId: data.brandId || "",
            thumbnail: data.thumbnail || null,
            productImages: data.productImages || [],
            isActive: data.isActive ?? true,
          });
          setOriginalSkuCode(data.skuCode || "");
        } else {
          Swal.fire({
            icon: "error",
            title: "Product Not Found",
            text: "The product you're trying to edit doesn't exist.",
          });
          navigate("/product-list");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load product data.",
        });
      }
    };

    fetchProductData();
  }, [productId, isEditMode, navigate]);

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
      } finally {
        setLoading(false);
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

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) return data.data.url;
      else throw new Error("ImgBB upload failed");
    } catch (error) {
      console.error("ImgBB Upload Error:", error);
      return null;
    }
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
    }
    if (formData.productImages.length === 0) {
      newErrors.productImages = "At least one product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
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
          return;
        }
      }

      Swal.fire({
        title: isEditMode ? "Updating..." : "Uploading...",
        text: "Please wait while we save your product.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Upload thumbnail (handles both new uploads and existing URLs)
      const thumbnailUrl = await uploadToImgBB(formData.thumbnail);
      if (!thumbnailUrl) throw new Error("Thumbnail upload failed");

      // Upload product images
      const productImageUrls = [];
      for (const img of formData.productImages) {
        const url = await uploadToImgBB(img);
        if (url) productImageUrls.push(url);
      }

      // Get category & brand names
      const selectedCategory = categories.find((cat) => cat.value === formData.categoryId);
      const selectedBrand = brands.find((br) => br.value === formData.brandId);

      // Prepare product data
      const productData = {
        ...formData,
        categoryName: selectedCategory?.label || "",
        brandName: selectedBrand?.label || "",
        thumbnail: thumbnailUrl,
        productImages: productImageUrls,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        // Update existing product
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
          ...productData,
          updatedAt: serverTimestamp(),
        });

        Swal.fire({
          icon: "success",
          title: "Product Updated!",
          text: "Your product has been successfully updated.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // Create new product
        const docRef = doc(collection(db, "products"));
        await setDoc(docRef, {
          ...productData,
          productId: docRef.id,
          createdAt: serverTimestamp(),
        });

        Swal.fire({
          icon: "success",
          title: "Product Added!",
          text: "Your product has been successfully created.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      navigate('/product-list');

      // Reset form only if not in edit mode
      if (!isEditMode) {
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
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while saving the product.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
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
      <FormContainer
        title={isEditMode ? "Edit Product" : "Add Product"}
        onCancel={() => navigate('/product-list')}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update Product" : "Create Product"}
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
              initialImage={isEditMode ? formData.thumbnail : null}
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
              initialImages={isEditMode ? formData.productImages : []}
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
          />
          <label htmlFor="isActive">Is Active</label>
        </div>
      </FormContainer>
    </>
  );
};

export default ProductForm;