import React, { useEffect, useState } from "react";




import Swal from "sweetalert2";

import BreadCrumb from "../../../layout/BreadCrumb";
import AddButton from "../../../layout/AddButton";
import DataTable from "../../../layout/DataTable";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash2 } from "lucide-react";
import { PageHeader } from "../../../common/PageHeader";
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";

const GalleryList = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and gallery items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories first
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesMap = {};
        categoriesSnapshot.docs.forEach((doc) => {
          categoriesMap[doc.id] = doc.data().categoryName;
        });
        setCategories(categoriesMap);

        // Fetch gallery items
        const gallerySnapshot = await getDocs(collection(db, "gallery"));
        const galleryList = gallerySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));

        setGallery(galleryList);
      } catch (error) {
        console.error("Error fetching gallery: ", error);
        setError("Failed to load gallery. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "title", title: "Title" },
    { key: "category", title: "Category" },
    { key: "photo", title: "Photo" },
    { key: "priority", title: "Priority" },
    { key: "isActive", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  const handleEdit = (item) => {
    navigate(`/portfolio/gallery/edit-gallery/${item.id}`, {
      state: {
        galleryData: {
          title: item.title,
          category: item.category,
          photo: item.photo,
          priority: item.priority,
          isActive: item.isActive,
          id: item.id
        }
      }
    });
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${item.title}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "gallery", item.id));

        setGallery((prev) => prev.filter((g) => g.id !== item.id));

        Swal.fire("Deleted!", "Gallery item has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting gallery item: ", error);
        Swal.fire("Error!", "Failed to delete gallery item.", "error");
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

    if (column.key === "category") {
      return categories[item.category] || "Unknown Category";
    }

    if (column.key === "photo") {
      return (
        <div className="w-15 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt="gallery"
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
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item[column.key] === true
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
              className={`flex items-center justify-center rounded transition-colors ${
                action.label === "Edit" ? "text-green-600" : ""
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
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Gallery List", path: "#" },
        ]}
      />
      <div className="px-2">
        <div className="mt-6">
          <PageHeader
            title="Gallery List"
            className="border-b border-gray-200 pb-4"
            actionButton={
              <AddButton
                title="Create New"
                onClick={() => navigate("/portfolio/gallery/galleryForm")}
                disabled={loading}
              />
            }
          />

          {!loading && !error && (
            <DataTable
              columns={columns}
              data={gallery}
              actions={actions}
              renderCell={renderCell}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default GalleryList;