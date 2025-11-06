import React, { useState, useEffect } from 'react';
import { PageHeader } from "../../../common/PageHeader";
import BreadCrumb from "../../../layout/BreadCrumb";
import {SquarePen, Trash2} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";
import Swal from "sweetalert2";
import AddButton from '../../../layout/AddButton';
import { useNavigate } from 'react-router-dom';
import DataTable from "../../../layout/DataTable";

const PlayschoolGalleyList = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, 'playschoolgalley'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const galleriesList = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        index: index + 1,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setGalleries(galleriesList);
    } catch (error) {
      console.error("Error fetching galleries: ", error);
      setError("Failed to load galleries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "index", title: "#" },
    { key: "title", title: "Title" },
    { key: "category", title: "Category" },
    { key: "image", title: "Image" },
    { key: "createdAt", title: "Date" },
    { key: "actions", title: "Actions" },
  ];

const handleEdit = (gallery) => {
     navigate(`/playschool/edit-gallery/${gallery.id}`, {
    state: {
      galleryData: {
       title: gallery.title ,
        image: gallery.image,
        category: gallery.category ,
        id: gallery.id
      }
    }
  });
  };

  const handleDelete = async (gallery) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${gallery.title}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "playschoolgalley", gallery.id));

        setGalleries((prev) => prev.filter((c) => c.id !== gallery.id));

        Swal.fire("Deleted!", "Gallery has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting gallery: ", error);
        Swal.fire("Error!", "Failed to delete gallery.", "error");
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

  if (column.key === "image") {
    return (
      <div className="w-15 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        {item[column.key] ? (
          <img
            src={item[column.key]}
            alt="image"
            className="w-full h-full object-fill rounded-lg"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-400 text-xs">No Image</span>
        )}
      </div>
    );
  }

  if (column.key === "createdAt") {
    const date = item[column.key];
    return date ? new Date(date).toLocaleString() : "-";
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
          { label: "Playschool Website", path: "#" },
          { label: "Gallrey List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Galley List"
          className="border-b border-gray-200 pb-4"
           actionButton={
              <AddButton
                title="Create New"
                onClick={() => navigate("/playschool/add-gallrey")}
                disabled={loading}
              />
            }
        />

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            data={galleries}
            columns={columns}
            actions={actions}
            renderCell={renderCell}
          />
        )}
      </div>
    </>
  );
};

export default PlayschoolGalleyList;