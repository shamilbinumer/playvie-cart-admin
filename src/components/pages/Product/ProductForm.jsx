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
import ProductPreview from "./ProductPreview";
import ColorVariantManager from "./ColorVariantManager";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const isEditMode = Boolean(productId);
  const viewMode = location.state?.viewMode || false;

  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    skuCode: "",
    shortDescription: "",
    longDescription: "",
    mrp: "",
    stock: 1,
    salesPrice: "",
    purchaseRate: "",
    handlingTime: "",
    categoryId: "",
    ageByCategoryIds: [],
    brandId: "",
    thumbnail: null,
    productImages: [],
    isActive: true,
    oneRating: 0,
    twoRating: 0,
    threeRating: 0,
    fourRating: 0,
    fiveRating: 0,
    featured: false,
    hasColorVariants: false,  // NEW
    colorVariants: [],
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [ageByCategories, setAgeByCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [originalSkuCode, setOriginalSkuCode] = useState("");

  // Load product data from navigation state (edit mode)
  useEffect(() => {
    if (isEditMode && location.state?.productData) {
      const productData = location.state.productData;
      setFormData({
        productName: productData.productName || "",
        productCode: productData.productCode || "",
        skuCode: productData.skuCode || "",
        shortDescription: productData.shortDescription || "",
        longDescription: productData.longDescription || "",
        mrp: productData.mrp || "",
        stock: productData.stock || 1,
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
        ageByCategoryIds: productData.ageByCategoryIds || [],
        hasColorVariants: productData.hasColorVariants || false,  // NEW
        colorVariants: productData.colorVariants || [],            // NEW
      });
      setOriginalSkuCode(productData.skuCode || "");
    } else if (isEditMode && !location.state?.productData) {
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
        const categoriesCollection = collection(db, "main-category");
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

        setAgeByCategories(categoryList);
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

    // NEW: Color variants validation
    if (formData.hasColorVariants) {
      if (formData.colorVariants.length === 0) {
        newErrors.colorVariants = "At least one color variant is required when color variants are enabled";
      } else {
        // Validate each variant
        let variantErrors = [];
        formData.colorVariants.forEach((variant, index) => {
          if (!variant.colorName) {
            variantErrors.push(`Variant ${index + 1}: Color name is required`);
          }
          if (!variant.skuCode) {
            variantErrors.push(`Variant ${index + 1}: SKU code is required`);
          }
          if (!variant.thumbnail) {
            variantErrors.push(`Variant ${index + 1}: Thumbnail is required`);
          }
          if (!variant.productImages || variant.productImages.length === 0) {
            variantErrors.push(`Variant ${index + 1}: At least one product image is required`);
          }
        });

        if (variantErrors.length > 0) {
          newErrors.colorVariants = variantErrors.join('; ');
        }
      }
    } else {
      // Original validation for non-variant products
      if (!formData.thumbnail) {
        newErrors.thumbnail = "Thumbnail image is required";
      } else if (typeof formData.thumbnail === 'string' && formData.thumbnail.trim() === '') {
        newErrors.thumbnail = "Thumbnail image is required";
      }
      if (formData.productImages.length === 0) {
        newErrors.productImages = "At least one product image is required";
      }
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

      // NEW: Check for duplicate variant SKUs
      if (formData.hasColorVariants) {
        const variantSkus = formData.colorVariants.map(v => v.skuCode);
        const productsRef = collection(db, "products");

        for (const sku of variantSkus) {
          const q = query(productsRef, where("colorVariants", "array-contains", { skuCode: sku }));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty && (!isEditMode || querySnapshot.docs[0].id !== productId)) {
            Swal.fire({
              icon: "warning",
              title: "Duplicate Variant SKU!",
              text: `Variant SKU "${sku}" already exists. Please use unique SKU codes.`,
            });
            setLoading(false);
            return;
          }
        }
      }

      let thumbnailUrl = formData.thumbnail;
      let productImageUrls = [];
      let uploadedColorVariants = [];

      // NEW: Handle color variants
      if (formData.hasColorVariants) {
        // Upload images for each color variant
        for (const variant of formData.colorVariants) {
          try {
            // Upload variant thumbnail
            const variantThumbnailUrl = await uploadToImgBB(variant.thumbnail);

            // Upload variant product images
            const variantImageUrls = [];
            for (const img of variant.productImages) {
              const url = await uploadToImgBB(img);
              if (url) variantImageUrls.push(url);
            }

            uploadedColorVariants.push({
              colorId: variant.colorId,
              colorName: variant.colorName,
              colorCode: variant.colorCode,
              skuCode: variant.skuCode,
              thumbnail: variantThumbnailUrl,
              productImages: variantImageUrls,
              stock: variant.stock,
              isActive: variant.isActive
            });
          } catch (error) {
            console.error(`Error uploading images for variant ${variant.colorName}:`, error);
            throw new Error(`Failed to upload images for ${variant.colorName}: ${error.message}`);
          }
        }
      } else {
        // Original image upload logic for non-variant products
        try {
          thumbnailUrl = await uploadToImgBB(formData.thumbnail);
          if (!thumbnailUrl) throw new Error("Thumbnail upload failed");
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          throw new Error("Failed to upload thumbnail: " + error.message);
        }

        for (const img of formData.productImages) {
          try {
            const url = await uploadToImgBB(img);
            if (url) productImageUrls.push(url);
          } catch (error) {
            console.error("Error uploading product image:", error);
            throw new Error("Failed to upload product images: " + error.message);
          }
        }
      }

      // Get category & brand names
      const selectedCategory = categories.find((cat) => cat.value === formData.categoryId);
      const selectedBrand = brands.find((br) => br.value === formData.brandId);

      // Calculate total stock for variant products
      const totalStock = formData.hasColorVariants
        ? uploadedColorVariants.reduce((sum, v) => sum + v.stock, 0)
        : Number(formData.stock);

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
        thumbnail: formData.hasColorVariants ? (uploadedColorVariants[0]?.thumbnail || "") : thumbnailUrl,
        productImages: formData.hasColorVariants ? (uploadedColorVariants[0]?.productImages || []) : productImageUrls,
        isActive: formData.isActive,
        oneRating: formData.oneRating,
        twoRating: formData.twoRating,
        threeRating: formData.threeRating,
        fourRating: formData.fourRating,
        fiveRating: formData.fiveRating,
        stock: totalStock,
        updatedAt: serverTimestamp(),
        ageByCategoriesIds: formData.ageByCategoryIds,
        featured: formData.featured || false,
        hasColorVariants: formData.hasColorVariants,  // NEW
        colorVariants: uploadedColorVariants,         // NEW
      };

      if (isEditMode) {
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
          { label: "Product List", path: "/product-list" },
          {
            label: viewMode
              ? "View Product"
              : isEditMode
                ? "Edit Product"
                : "Add Product",
            path: "#",
          }

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
        cancelText={viewMode ? null : "Cancel"}
        {...(!viewMode && {
          submitText: loading
            ? "Saving..."
            : isEditMode
              ? "Update Product"
              : "Create Product"
        })}

      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Product Name"
            placeholder="Enter product name"
            value={formData.productName}
            onChange={(value) => handleInputChange("productName", value)}
            error={errors.productName}
            disabled={viewMode}
            required
          />
          <TextInput
            label="Product Code"
            placeholder="Enter product code"
            value={formData.productCode}
            onChange={(value) => handleInputChange("productCode", value)}
            error={errors.productCode}
            disabled={viewMode}
            required
          />
          <TextInput
            label="SKU Code"
            placeholder="Enter SKU code"
            value={formData.skuCode}
            onChange={(value) => handleInputChange("skuCode", value)}
            error={errors.skuCode}
            disabled={viewMode}
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
            disabled={viewMode}
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
            disabled={viewMode}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <TextInput
            label="MRP"
            placeholder="MRP"
            value={formData.mrp}
            onChange={(value) => handleInputChange("mrp", value)}
            error={errors.mrp}
            required
            type="number"
            disabled={viewMode}
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
            disabled={viewMode}
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
            disabled={viewMode}
            step="0.01"
          />
          <TextInput
            label="Stock Quantity"
            placeholder="Stock"
            value={formData.stock}
            onChange={(value) => handleInputChange("stock", value)}
            error={errors.stock}
            required
            type="number"
            min="0"
            disabled={viewMode}
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
            disabled={viewMode}
          />
          <SearchableDropdown
            label="Category"
            options={categories}
            value={formData.categoryId}
            onChange={(value) => handleInputChange("categoryId", value)}
            placeholder="Select category"
            error={errors.categoryId}
            required
            multiple
            disabled={viewMode}
          />
          <SearchableDropdown
            label="Age By Category"
            options={ageByCategories}
            value={formData.ageByCategoryIds}
            onChange={(value) => handleInputChange("ageByCategoryIds", value)}
            placeholder="Select age by category"
            error={errors.ageByCategoryIds}
            required
            multiple
            disabled={viewMode}
          />
          <SearchableDropdown
            label="Brand"
            options={brands}
            value={formData.brandId}
            onChange={(value) => handleInputChange("brandId", value)}
            placeholder="Select brand"
            error={errors.brandId}
            required
            disabled={viewMode}
          />
        </div>
        <div className="col-span-full">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="hasColorVariants"
              checked={formData.hasColorVariants}
              onChange={(e) => handleInputChange("hasColorVariants", e.target.checked)}
              className="accent-[#81184e]"
              disabled={viewMode}
            />
            <label htmlFor="hasColorVariants" className="text-sm font-medium text-gray-700">
              Enable Color Variants
            </label>
            <span className="text-xs text-gray-500">
              (Check this if product comes in multiple colors)
            </span>
          </div>

          {formData.hasColorVariants && (
            <ColorVariantManager
              variants={formData.colorVariants}
              onVariantsChange={(variants) => handleInputChange("colorVariants", variants)}
              disabled={viewMode}
              errors={errors}
            />
          )}
        </div>

      {
        !formData.hasColorVariants && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {viewMode && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              <div className="w-20 h-20 overflow-hidden rounded-md">
                <img src={formData.thumbnail} alt="" />
              </div>
            </>
          )}

          {
            !viewMode && <div>
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
                  disabled={viewMode}
                />
                {errors.thumbnail && (
                  <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>
                )}
              </div>
            </div>
          }
          {viewMode && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Images
              </label>
              {
                formData.productImages.length === 0 ? (
                  <p>No images available</p>
                ) : (
                  <div className="flex space-x-2 overflow-x-auto">
                    {formData.productImages.map((imgUrl, index) => (
                      <div key={index} className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
                        <img src={imgUrl} alt={`Product ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}
          {!viewMode && <div>
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
                disabled={viewMode}
              />
              {errors.productImages && (
                <p className="mt-1 text-sm text-red-600">{errors.productImages}</p>
              )}
            </div></div>}
        </div>
        )
      }

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            disabled={viewMode}
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="accent-[#81184e]"
          />
          <label htmlFor="isActive">Is Active</label>
        </div>
        <ProductPreview formData={formData} />
      </FormContainer>
    </>
  );
};

export default ProductForm;