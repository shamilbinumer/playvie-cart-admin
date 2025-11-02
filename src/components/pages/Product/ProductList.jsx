import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // adjust path as per your project
import BreadCrumb from "../../layout/BreadCrumb";
import { PageHeader } from "../../common/PageHeader";
import AddButton from "../../layout/AddButton";
import DataTable from "../../layout/DataTable";
import { SquarePen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Preloader from "../../common/Preloader";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productData = querySnapshot.docs.map((doc, index) => ({
        ...doc.data()
      }));
      setProducts(productData);
      console.log(productData);

    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load product list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "productName", title: "Product Name" },
    { key: "isActive", title: "Status" },
    { key: "thumbnail", title: "Image" },
    { key: "actions", title: "Actions" },
  ];

  // 🔹 Edit handler
  const handleEdit = (product) => {
    console.log("Editing product:", product);

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
        fetchProducts(); // refresh list
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

  const actions = [
    {
      label: "Edit",
      handler: handleEdit,
      icon: SquarePen,
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
                } ${action.label === "Delete" ? "text-red-600" : ""}`}
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

        {loading ? (
          <div><Preloader /></div>
        )
          : (
            <div className="p-2">
              <DataTable
                columns={columns}
                data={products}
                actions={actions}
                renderCell={renderCell}
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductList;
