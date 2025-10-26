import React, { useState, useEffect } from 'react';
import { PageHeader } from "../../../common/PageHeader";
import BreadCrumb from "../../../layout/BreadCrumb";
import DataTable from "../../../layout/DataTable";
import { Eye, RefreshCw, Phone, Mail, MapPin, Package } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";
import Swal from "sweetalert2";

const AdmissionEnquiryList = () => {
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

      const q = query(collection(db, 'admissionEnquiries'), orderBy('createdAt', 'desc'));
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
    { key: "childName", title: "Name" },
    { key: "contactNo", title: "Contact" },
    { key: "age", title: "Age" },
    { key: "place", title: "Place" },
    { key: "createdAt", title: "Date" },
    { key: "actions", title: "Actions" },
  ];

  const handleView = (enquiry) => {

    Swal.fire({
      title: '<strong>Enquiry Details</strong>',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="margin-bottom: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Name:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.childName}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Contact:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.age}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Email:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.contactNo}</span>
            </div>
             <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Email:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.parentName}</span>
            </div>
             <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Email:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.place}</span>
            </div>
             <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Email:</span>
              <span style="font-weight: 600; font-size: 15px;">${enquiry.pincode}</span>
            </div>
            <div style="display: flex; align-items: start; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 14px; width: 100px;">Address:</span>
              <span style="font-weight: 600; font-size: 15px; flex: 1;">${enquiry.address}</span>
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
      confirmButtonColor: '#81184e',
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

    if (column.key === "createdAt") {
      return (
        <span className="text-sm text-gray-600">
          {formatDate(item.createdAt)}
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
          { label: "Playschool Website", path: "#" },
          { label: "Admission Enquiry List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Admission Enquiry List"
          className="border-b border-gray-200 pb-4"
        />

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={enquiries}
            actions={actions}
            renderCell={renderCell}
          />
        )}
      </div>
    </>
  );
};

export default AdmissionEnquiryList;