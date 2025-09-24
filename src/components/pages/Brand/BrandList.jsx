import React, { useEffect, useState } from "react";
import { PageHeader } from "../../common/PageHeader";
import AddButton from "../../layout/AddButton";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "../../layout/BreadCrumb";
import DataTable from "../../layout/DataTable";
import { SquarePen, Trash2, Loader2 } from "lucide-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import Preloader from "../../common/Preloader";
import Swal from "sweetalert2";

const BrandList = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(collection(db, "brands"));
        const brandList = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));
        
        setBrands(brandList);
      } catch (error) {
        console.error("Error fetching brands: ", error);
        setError("Failed to load brands. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "brandName", title: "Name" },
    { key: "isActive", title: "Status" },
    { key: "brandLogo", title: "Thumbnail" },
    { key: "actions", title: "Actions" },
  ];

  const handleEdit = (brand) => {
    navigate(`/master/edit-brand/${brand.id}`);
  };

  const handleDelete = async (brand) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${brand.brandName}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "brands", brand.id));

        // update state without re-fetching
        setBrands((prev) => prev.filter((b) => b.id !== brand.id));

        Swal.fire("Deleted!", "Brand has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting brand: ", error);
        Swal.fire("Error!", "Failed to delete brand.", "error");
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

    if (column.key === "brandLogo") {
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
    return <div><Preloader /></div>
  }
  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Brand List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Brand List"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <AddButton
              title="Create New"
              onClick={() => navigate("/master/add-brand")}
              disabled={loading}
            />
          }
        />

        {/* Data Table */}
        {!loading && !error && brands.length > 0 && (
          <DataTable
            columns={columns}
            data={brands}
            actions={actions}
            renderCell={renderCell}
          />
        )}
      </div>
    </>
  );
};

export default BrandList;