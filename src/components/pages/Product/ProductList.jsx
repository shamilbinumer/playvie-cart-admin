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
  getCountFromServer
} from "firebase/firestore";
import { db } from "../../../firebase";
import BreadCrumb from "../../layout/BreadCrumb";
import { PageHeader } from "../../common/PageHeader";
import AddButton from "../../layout/AddButton";
import ServerPaginatedDataTable from "../../layout/ServerPaginatedDataTable";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Preloader from "../../common/Preloader";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Store document snapshots for pagination
  const [lastDocs, setLastDocs] = useState({});

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // 🔹 Fetch total count
  const fetchTotalCount = async () => {
    try {
      const collectionRef = collection(db, "products");
      const snapshot = await getCountFromServer(collectionRef);
      setTotalItems(snapshot.data().count);
    } catch (error) {
      console.error("Error fetching count:", error);
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
          orderBy("productName"), // Change orderBy field as needed
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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setLastDocs({}); // Clear cached documents
    fetchProducts(1, newItemsPerPage);
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

        // Refresh count and current page
        await fetchTotalCount();

        // If current page is now empty and not the first page, go back one page
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          fetchProducts(currentPage - 1);
        } else {
          fetchProducts(currentPage);
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

        <div className="p-2">
          <ServerPaginatedDataTable
            columns={columns}
            data={products}
            actions={actions}
            renderCell={renderCell}
            currentPage={currentPage}
            totalPages={totalPages}
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