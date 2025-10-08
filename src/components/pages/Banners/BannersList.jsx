import React, { useEffect, useState } from 'react'   
import BreadCrumb from '../../layout/BreadCrumb'
import { PageHeader } from '../../common/PageHeader'
import AddButton from '../../layout/AddButton'
import DataTable from '../../layout/DataTable'
import { useNavigate } from 'react-router-dom'
import { use } from 'react'
import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'
import { SquarePen, Trash } from 'lucide-react'
import Swal from 'sweetalert2'

const BannerList = () => {
    const [loading,setLoading] = useState(false);
    const [banners,setBanners]= useState([])
    const [error,setError]= useState(null)
    const navigate = useNavigate();
      const columns = [
    { key: "index", title: "#" },
    { key: "bannerImage", title: "Image" },
    { key: "priority", title: "Priority" },
    { key: "startDate", title: "Start Date" },
    { key: "endDate", title: "End Date" },
    { key: "isActive", title: "Status" },
    { key: "actions", title: "Actions" },
    ];
    useEffect(() => {
        const fetchBanners = async () => {
          try {
            setLoading(true);
            setError(null);
    console.log("Fetching banners...");
    
            const querySnapshot = await getDocs(collection(db, "banners"));
            const bannerList = querySnapshot.docs.map((doc, index) => ({
              ...doc.data(),
              index: index + 1,
            }));
            console.log(bannerList,"banners");
            setBanners(bannerList);
          } catch (error) {
            console.error("Error fetching banners: ", error);
            setError("Failed to load banners. Please try again.");
          } finally {
            setLoading(false);
          }
        };
    
        fetchBanners();
      }, []);
 const handleEdit = (banner) => {
    Navigate(`/master/edit-banner/${banner.id}`);
  };
   const handleDelete = async (banner) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
  
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "banners", banner.id));
  
          // update state without re-fetching
          setBanners((prev) => prev.filter((b) => b.id !== banner.id));
  
          Swal.fire("Deleted!", "Banner has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting banner: ", error);
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
      icon: Trash,
    },
  ];
  
 const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "bannerImage") {
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


     
    
  return (
    <div>
       <BreadCrumb
        items={[
          { label: "Banners", path: "#" },
          { label: "Banner List", path: "#" },
        ]}
      />
       <div className="p-2">
              <PageHeader
                title="Banner List"
                className="border-b border-gray-200 pb-4"
                actionButton={
                  <AddButton
                    title="Create New"
                    onClick={() => navigate("/banners/add-banner")}
                    // disabled={loading}
                  />
                }
              />
      
              {/* Data Table */}
              {!loading && !error && banners.length > 0 && (
                <DataTable
                  columns={columns}
                  data={banners}
                  actions={actions}
                  renderCell={renderCell}
                />
              )}
            </div>
    </div>
  )
}

export default BannerList
