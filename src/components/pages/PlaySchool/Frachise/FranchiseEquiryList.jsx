import React, { useState, useEffect } from 'react';
import { PageHeader } from "../../../common/PageHeader";
import BreadCrumb from "../../../layout/BreadCrumb";
import DataTable from "../../../layout/DataTable";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "../../../../firebase";
import Preloader from "../../../common/Preloader";

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

      const q = query(collection(db, 'frachiseEnquiries'), orderBy('createdAt', 'desc'));
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
    { key: "fullName", title: "Name" },
    { key: "email", title: "Email" },
    { key: "contactNo", title: "ContactNo" },
    { key: "place", title: "Place" },
    { key: "createdAt", title: "Date" },
  ];


  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };


  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "createdAt") {
      return (
        <span className="text-sm text-gray-600">
          {formatDate(item.createdAt)}
        </span>
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
          { label: "Franchise Enquiry List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Franchise Enquiry List"
          className="border-b border-gray-200 pb-4"
        />

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columns}
            data={enquiries}
            renderCell={renderCell}
          />
        )}
      </div>
    </>
  );
};

export default FranchiseEnquiryList;