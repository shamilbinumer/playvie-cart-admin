import React, { useState, useEffect } from 'react';
import { PageHeader } from "../../../common/PageHeader";
import BreadCrumb from "../../../layout/BreadCrumb";
import DataTable from "../../../layout/DataTable";
import { Eye, RefreshCw, Phone, Mail, MapPin, Package } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";
import Swal from "sweetalert2";

const FranchiseEnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, 'service_enquiry'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const enquiriesList = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        index: index + 1,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setEnquiries(enquiriesList);
    } catch (error) {
      console.error("Error fetching enquiries: ", error);
      setError("Failed to load enquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "index", title: "#" },
    { key: "name", title: "Name" },
    { key: "contactNo", title: "Contact" },
    { key: "email", title: "Email" },
    { key: "selectedServices", title: "Services" },
    { key: "createdAt", title: "Date" },
    { key: "actions", title: "Actions" },
  ];

  const handleView = (enquiry) => {
    const servicesHtml = enquiry.selectedServices
      .map(service => `<span style="display: inline-block; background: #EBF5FF; color: #1E40AF; padding: 4px 12px; border-radius: 12px; margin: 4px; font-size: 13px;">${service}</span>`)
      .join('');

    Swal.fire({
      title: '<strong>Enquiry Details</strong>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="margin-bottom: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Name:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.name}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Contact:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.contactNo}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Email:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.email}</span>
            </div>
            <div style="display: flex; align-items: start; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Address:</span>
              <span style="font-weight: 600; font-size: 15px; flex: 1;">${enquiry.address}</span>
            </div>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 15px; margin-top: 15px;">
            <div style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">Selected Services:</div>
            <div style="margin-top: 8px;">
              ${servicesHtml}
            </div>
          </div>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 15px; margin-top: 15px;">
            <div style="color: #6B7280; font-size: 13px;">
              Submitted: ${formatDate(enquiry.createdAt)}
            </div>
          </div>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Close',
      confirmButtonColor: '#3B82F6',
    });
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const actions = [
    {
      label: "View",
      handler: handleView,
      icon: Eye,
    }
  ];

  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "selectedServices") {
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.selectedServices.slice(0, 2).map((service, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {service}
            </span>
          ))}
          {item.selectedServices.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{item.selectedServices.length - 2} more
            </span>
          )}
        </div>
      );
    }

    if (column.key === "createdAt") {
      return (
        <span className="text-sm text-gray-600">
          {formatDate(item.createdAt)}
        </span>
      );
    }

    if (column.key === "contactNo") {
      return (
        <span className="font-medium text-gray-900">{item.contactNo}</span>
      );
    }

    if (column.key === "email") {
      return (
        <span className="text-sm text-gray-600 break-all">{item.email}</span>
      );
    }

    if (column.key === "actions" && actions) {
      return (
        <div className="flex space-x-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.handler(item)}
              className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors"
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
          { label: "Service", path: "#" },
          { label: "Enquiry List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Service Enquiry List"
          className="border-b border-gray-200 pb-4"
          actionButton={
            <button
              onClick={fetchEnquiries}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={enquiries}
            actions={actions}
            renderCell={renderCell}
          />
        )}

        {/* Empty State */}
        {!loading && !error && enquiries.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center mt-4">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No enquiries yet
            </h3>
            <p className="text-gray-500">
              Enquiries will appear here once submitted
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default FranchiseEnquiryList;