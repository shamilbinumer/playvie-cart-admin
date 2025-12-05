import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../../firebase";
import Swal from "sweetalert2";
import BreadCrumb from "../../../layout/BreadCrumb";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";


const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const navigate = useNavigate();

  // Icon mapping for display
  const iconMap = {
    Gamepad2: "🎮",
    Building2: "🏢",
    Settings: "⚙️",
    Heart: "❤️",
    Users: "👥",
    Landmark: "🏛️",
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, filterStatus]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by priority (lower number = higher priority)
      servicesData.sort((a, b) => {
        const priorityA = parseInt(a.priority) || 999;
        const priorityB = parseInt(b.priority) || 999;
        return priorityA - priorityB;
      });

      setServices(servicesData);
      setFilteredServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire("Error!", "Failed to fetch services.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.services?.some((item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by status
    if (filterStatus === "active") {
      filtered = filtered.filter((service) => service.isActive);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((service) => !service.isActive);
    }

    setFilteredServices(filtered);
  };

  const handleAdd = () => {
    navigate("/portfolio/service/ServiceForm");
  };

  const handleEdit = (service) => {
    navigate(`/master/service-form/${service.id}`, {
      state: { serviceData: service },
    });
  };

  const handleView = (service) => {
    const serviceItems = service.services
      ?.map((item, index) => `${index + 1}. ${item}`)
      .join("<br/>");

    Swal.fire({
      title: service.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Icon:</strong> ${iconMap[service.icon] || service.icon}</p>
          <p><strong>Color:</strong> <span style="display: inline-block; width: 20px; height: 20px; background-color: ${service.color}; border: 1px solid #ccc; border-radius: 3px; vertical-align: middle;"></span> ${service.color}</p>
          <p><strong>Priority:</strong> ${service.priority}</p>
          <p><strong>Status:</strong> ${service.isActive ? "Active" : "Inactive"}</p>
          <br/>
          <img src="${service.thumbnail}" alt="${service.title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;"/>
          <br/>
          <strong>Service Items:</strong><br/>
          ${serviceItems || "No items"}
        </div>
      `,
      width: 600,
      confirmButtonText: "Close",
      confirmButtonColor: "#81184e",
    });
  };

  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${service.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "services", service.id));
        Swal.fire({
          title: "Deleted!",
          text: "Service has been deleted.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          position: 'top-end',
        });
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        Swal.fire("Error!", "Failed to delete service.", "error");
      }
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const docRef = doc(db, "services", service.id);
      await updateDoc(docRef, {
        isActive: !service.isActive,
        updatedAt: new Date(),
      });

      Swal.fire({
        title: "Success!",
        text: `Service ${!service.isActive ? "activated" : "deactivated"} successfully.`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: 'top-end',
      });

      fetchServices();
    } catch (error) {
      console.error("Error updating service status:", error);
      Swal.fire("Error!", "Failed to update service status.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81184e]"></div>
      </div>
    );
  }

  return (
    <>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Service List", path: "/master/service-list" },
        ]}
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Service List</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage all services ({filteredServices.length} {filterStatus !== 'all' ? filterStatus : 'total'})
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-[#81184e] text-white px-4 py-2 rounded-lg hover:bg-[#5f1039] transition-colors"
              >
                <Plus size={20} />
                Add Service
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title or service items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81184e]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81184e]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found</p>
                <button
                  onClick={handleAdd}
                  className="mt-4 text-[#81184e] hover:text-[#5f1039] font-medium"
                >
                  Add your first service
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thumbnail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {service.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={service.thumbnail}
                          alt={service.title}
                          className="h-12 w-20 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {service.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl" title={service.icon}>
                          {iconMap[service.icon] || "❓"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: service.color }}
                          ></div>
                          <span className="text-xs text-gray-600">{service.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {service.services?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(service)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceList;