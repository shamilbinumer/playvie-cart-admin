import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  where
} from "firebase/firestore";
import { db } from "../../../firebase";
import BreadCrumb from "../../layout/BreadCrumb";
import { PageHeader } from "../../common/PageHeader";
import AddButton from "../../layout/AddButton";
import ServerPaginatedDataTable from "../../layout/ServerPaginatedDataTable";
import { Eye, SquarePen, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Preloader from "../../common/Preloader";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Store document snapshots for pagination
  const [lastDocs, setLastDocs] = useState({});

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 🔹 Fetch total count
  const fetchTotalCount = async (searchQuery = "") => {
    try {
      const collectionRef = collection(db, "products");
      
      if (searchQuery) {
        // For search, we need to get all docs and filter (Firestore limitation)
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        const filtered = snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 data.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 data.skuCode?.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setTotalItems(filtered.length);
      } else {
        const snapshot = await getCountFromServer(collectionRef);
        setTotalItems(snapshot.data().count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  // 🔹 Search products from Firestore
  const searchProducts = async (searchQuery) => {
    try {
      setTableLoading(true);
      const collectionRef = collection(db, "products");
      const q = query(collectionRef, orderBy("productName"));
      const querySnapshot = await getDocs(q);

      // Filter results on client side (Firestore limitation for partial text search)
      const filtered = querySnapshot.docs
        .filter(doc => {
          const data = doc.data();
          const search = searchQuery.toLowerCase();
          return (
            data.productName?.toLowerCase().includes(search) ||
            data.productCode?.toLowerCase().includes(search) ||
            data.skuCode?.toLowerCase().includes(search)
          );
        })
        .map(doc => ({
          id: doc.id,
          productId: doc.id,
          ...doc.data()
        }));

      setProducts(filtered);
      setTotalItems(filtered.length);
    } catch (error) {
      console.error("Error searching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to search products.",
      });
    } finally {
      setTableLoading(false);
    }
  };

  // 🔹 Fetch products from Firestore with pagination
  const fetchProducts = async (page = 1, perPage = itemsPerPage) => {
    try {
      setTableLoading(true);
      const collectionRef = collection(db, "products");

      let q;

      if (page === 1) {
        // First page query
        q = query(
          collectionRef,
          orderBy("productName"),
          limit(perPage)
        );
      } else {
        // Subsequent pages - use last document from previous page
        const lastDoc = lastDocs[page - 1];
        if (!lastDoc) {
          // If we don't have the last doc, refetch from beginning
          setCurrentPage(1);
          return;
        }

        q = query(
          collectionRef,
          orderBy("productName"),
          startAfter(lastDoc),
          limit(perPage)
        );
      }

      const querySnapshot = await getDocs(q);

      // Store the last document for next page
      if (querySnapshot.docs.length > 0) {
        setLastDocs(prev => ({
          ...prev,
          [page]: querySnapshot.docs[querySnapshot.docs.length - 1]
        }));
      }

      const productData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        productId: doc.id,
        ...doc.data()
      }));

      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load product list.",
      });
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await fetchTotalCount();
      await fetchProducts(1);
    };
    initializeData();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() === "") {
        // Reset to normal pagination
        setIsSearching(false);
        setCurrentPage(1);
        setLastDocs({});
        fetchTotalCount();
        fetchProducts(1);
      } else {
        setIsSearching(true);
        setCurrentPage(1);
        searchProducts(searchTerm.trim());
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Handle clear search
  const handleClearSearch = async () => {
    setSearchTerm("");
    setIsSearching(false);
    setCurrentPage(1);
    setLastDocs({});
    await fetchTotalCount();
    await fetchProducts(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!isSearching) {
      fetchProducts(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setLastDocs({});
    if (!isSearching) {
      fetchProducts(1, newItemsPerPage);
    }
  };

  const columns = [
    { key: "index", title: "#" },
    { key: "productName", title: "Product Name" },
    { key: "isActive", title: "Status" },
    { key: "thumbnail", title: "Image" },
    { key: "actions", title: "Actions" },
  ];

  // 🔹 Edit handler
  const handleEdit = (product) => {
    navigate(`/edit-product/${product.productId}`, {
      state: {
        productData: {
          productName: product.productName,
          productCode: product.productCode,
          skuCode: product.skuCode,
          shortDescription: product.shortDescription,
          longDescription: product.longDescription,
          mrp: product.mrp,
          salesPrice: product.salesPrice,
          purchaseRate: product.purchaseRate,
          handlingTime: product.handlingTime,
          categoryId: product.categoryId,
          brandId: product.brandId,
          thumbnail: product.thumbnail,
          productImages: product.productImages,
          isActive: product.isActive,
          fiveRating: product.fiveRating,
          fourRating: product.fourRating,
          threeRating: product.threeRating,
          twoRating: product.twoRating,
          oneRating: product.oneRating,
          id: product.id,
          stock: product.stock,
          ageByCategoryIds: product.ageByCategoryIds || [],
          featured: product.featured || false,
          hasColorVariants: product.hasColorVariants || false,
          colorVariants: product.colorVariants || [],
          hasSizeVariants: product.hasSizeVariants || false,
          sizeVariants: product.sizeVariants || [],
          unitId: product.unitId || "",
        }
      }
    });
  };

  // 🔹 Delete handler with SweetAlert confirmation
  const handleDelete = async (product) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDoc(doc(db, "products", product.productId));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refresh based on current mode
        if (isSearching) {
          await searchProducts(searchTerm.trim());
        } else {
          await fetchTotalCount();
          if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
            fetchProducts(currentPage - 1);
          } else {
            fetchProducts(currentPage);
          }
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete product.",
        });
      }
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/view-product/${product.productId}`, {
      state: {
        viewMode: true,
        productData: {
          productName: product.productName,
          productCode: product.productCode,
          skuCode: product.skuCode,
          shortDescription: product.shortDescription,
          longDescription: product.longDescription,
          mrp: product.mrp,
          salesPrice: product.salesPrice,
          purchaseRate: product.purchaseRate,
          handlingTime: product.handlingTime,
          categoryId: product.categoryId,
          brandId: product.brandId,
          thumbnail: product.thumbnail,
          productImages: product.productImages,
          isActive: product.isActive,
          fiveRating: product.fiveRating,
          fourRating: product.fourRating,
          threeRating: product.threeRating,
          twoRating: product.twoRating,
          oneRating: product.oneRating,
          id: product.id,
          stock: product.stock,
        }
      }
    });
  }

  const actions = [
    {
      label: "Edit",
      handler: handleEdit,
      icon: SquarePen,
    },
    {
      label: "View",
      handler: handleViewProduct,
      icon: Eye,
    },
    {
      label: "Delete",
      handler: handleDelete,
      icon: Trash2,
    },
  ];

  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "thumbnail") {
      return (
        <div className="w-15 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt="thumbnail"
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      );
    }

    if (column.key === "isActive") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${item[column.key] === true
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {item[column.key] ? "Active" : "Inactive"}
        </span>
      );
    }

    if (column.key === "actions" && actions) {
      return (
        <div className="flex space-x-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.handler(item)}
              className={`flex items-center justify-center rounded transition-colors ${action.label === "Edit" ? "text-green-600" : ""
                } ${action.label === "Delete" ? "text-red-600" : ""} ${action.label === "View" ? "text-yellow-600" : ""}`}
            >
              {action.icon && (
                <span className="mr-1">
                  <action.icon width={20} />
                </span>
              )}
            </button>
          ))}
        </div>
      );
    }

    return item[column.key] || "-";
  };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="relative">
      <div>
        <BreadCrumb items={[{ label: "Product List", path: "#" }]} />
        <PageHeader
          title="Product List"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <AddButton title="Create New" onClick={() => navigate("/add-product")} />
          }
        />

        {/* Search Bar */}
        <div className="p-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
              autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name, product code, or SKU..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" width={20} />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {isSearching && (
            <p className="mt-2 text-sm text-gray-600">
              Found {totalItems} result{totalItems !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        <div className="p-2">
          <ServerPaginatedDataTable
            columns={columns}
            data={products}
            actions={actions}
            renderCell={renderCell}
            currentPage={currentPage}
            totalPages={isSearching ? 1 : totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            loading={tableLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductList;