
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash2 } from "lucide-react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";
import BreadCrumb from "../../../layout/BreadCrumb";
import { PageHeader } from "../../../common/PageHeader";
import AddButton from "../../../layout/AddButton";
import DataTable from "../../../layout/DataTable";
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";

const RecomentedForYouList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(collection(db, "recommendedForYou"));
        const categoryList = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));

        setData(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "bannerImageUrl", title: "Name" },
    { key: "active", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  const handleEdit = (item) => {
    navigate(`/recommended-for-you/edit-recommended-for-you/${item.id}`, {
      state: {
        recomentedData: {
          bannerImageUrl: item.bannerImageUrl,
          priority: item.priority,
          active: item.active,
          productIds: item.productIds,
          id: item.id
        }
      }
    });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "recommendedForYou", item.id));

        setData((prev) => prev.filter((c) => c.id !== item.id));

        Swal.fire("Deleted!", "Category has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting category: ", error);
        Swal.fire("Error!", "Failed to delete category.", "error");
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

    if (column.key === "bannerImageUrl") {
      return (
        <div className="w-15 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt="thumbnail"
              className="w-full h-full object-fill rounded-lg"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      );
    }

    if (column.key === "active") {
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
    return (
      <div>
        <Preloader />
      </div>
    );
  }

  return (
    <>
      <BreadCrumb items={[
        { label: "Offers", path: "#" },
        { label: "Recommended For You", path: "#" }
      ]} />

      <div className="px-2">
        <div className="mt-6">
          <PageHeader
            title="Recommended For You"
            className="border-b border-gray-200 pb-4"
            actionButton={
              <AddButton title="Create New" onClick={() => navigate("/offers/add-recommended-for-you")} />
            }
          />

          {!loading && !error && (
            <DataTable
              columns={columns}
              data={data}
              actions={actions}
              renderCell={renderCell}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default RecomentedForYouList;

