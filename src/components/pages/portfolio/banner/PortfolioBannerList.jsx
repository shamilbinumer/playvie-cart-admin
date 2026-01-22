import Swal from "sweetalert2";
import { PageHeader } from "../../../common/PageHeader";
import AddButton from "../../../layout/AddButton";
import BreadCrumb from "../../../layout/BreadCrumb";
import DataTable from "../../../layout/DataTable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash2 } from "lucide-react";
import Preloader from "../../../common/Preloader";
import { db } from "../../../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const PortfolioBannerList = () => {
  const [loading, setLoading] = useState(true);
  const [portfolioBanners, setPortfolioBanners] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const columns = [
    { key: "index", title: "#" },
    { key: "bannerImageWeb", title: "Image" },
    { key: "priority", title: "Priority" },
    { key: "startDate", title: "Start Date" },
    { key: "endDate", title: "End Date" },
    { key: "isActive", title: "Status" },
    { key: "actions", title: "Actions" },
  ];

  useEffect(() => {
    const fetchPortfolioBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching portfolio banners...");
        
        const querySnapshot = await getDocs(collection(db, "portfolioBanner"));
        const portfolioBannerList = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));
        console.log(portfolioBannerList, "portfolio banners");
        setPortfolioBanners(portfolioBannerList);
      } catch (error) {
        console.error("Error fetching portfolio banners: ", error);
        setError("Failed to load portfolio banners. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioBanners();
  }, []);

  const handleEdit = (portfolioBanner) => {
    navigate(`/portfolio-banners/edit-portfolio-banner/${portfolioBanner.id}`, {
      state: {
        portfolioBannerData: {
          bannerName: portfolioBanner.bannerName,
          bannerImageWeb: portfolioBanner.bannerImageWeb,
          priority: portfolioBanner.priority,
          isActive: portfolioBanner.isActive,
          id: portfolioBanner.id,
          startDate: portfolioBanner.startDate,
          endDate: portfolioBanner.endDate,
        }
      }
    });
  };

  const handleDelete = async (portfolioBanner) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete this portfolio banner`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "PortfolioBanner", portfolioBanner.id));

        // update state without re-fetching
        setPortfolioBanners((prev) => prev.filter((b) => b.id !== portfolioBanner.id));

        Swal.fire("Deleted!", "Portfolio banner has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting portfolio banner: ", error);
        Swal.fire("Error!", "Failed to delete portfolio banner.", "error");
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

    if (column.key === "bannerImageWeb") {
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
    return <div><Preloader /></div>;
  }

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Portfolio Banners", path: "#" },
          { label: "Portfolio Banner List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Portfolio Banner List"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <AddButton
              title="Create New"
              onClick={() => navigate("/portfolio/Banner/PortfolioBannerForm")}
              disabled={loading}
            />
          }
        />
  
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={portfolioBanners}
            actions={actions}
            renderCell={renderCell}
          />
        )}

      </div>
    </>
  );
};

export default PortfolioBannerList;