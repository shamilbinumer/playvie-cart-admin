import React, { useState, useEffect } from 'react'
import BreadCrumb from '../../layout/BreadCrumb'
import { useNavigate } from 'react-router-dom';
import DataTable from '../../layout/DataTable';
import { PageHeader } from '../../common/PageHeader';
import { Switch } from '@mui/material';
import AddButton from '../../layout/AddButton';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path based on your structure
import Preloader from '../../common/Preloader';
import Swal from 'sweetalert2';

const CustomerList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          index: index + 1,
        }));
        
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setError("Failed to load users. Please try again.");
        Swal.fire("Error!", "Failed to load users.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { key: "index", title: "#" },
    { key: "fullName", title: "Name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },

    { key: "isActive", title: "Active/Inactive" }
  ];

  // Handle toggle status - updates Firebase
  const handleStatusToggle = async (user) => {
    try {
      const newStatus = !user.isActive;
      
      // Update in Firebase
      await updateDoc(doc(db, "users", user.id), {
        isActive: newStatus
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, isActive: newStatus }
            : u
        )
      );

      // Optional: Show success message
      // Swal.fire("Updated!", `User status changed to ${newStatus ? 'Active' : 'Inactive'}`, "success");
    } catch (error) {
      console.error("Error updating user status: ", error);
      Swal.fire("Error!", "Failed to update user status.", "error");
    }
  };

  const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "fullName") {
      return `${item.firstName || ''} ${item.lastName || ''}`.trim() || "-";
    }

    if (column.key === "avatar") {
      return (
        <div className="w-15 h-8 bg-gray-100 rounded-xs flex items-center justify-center">
          {item[column.key] ? (
            <img
              src={item[column.key]}
              alt="thumbnail"
              className="w-full h-full object-cover rounded-sm"
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
        <Switch
          checked={item.isActive || false}
          onChange={() => handleStatusToggle(item)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#81184e',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#81184e',
            },
          }}
        />
      );
    }

    return item[column.key] || "-";
  };

  if (loading) {
    return <div><Preloader /></div>
  }

  return (
    <div>
      <BreadCrumb
        items={[
           { label: "Users", path: "#" },
          { label: "Customer List", path: "#" },
        ]}
      />
      <div className="p-2">
        <PageHeader
          title="Customer List"
          className="border-b border-gray-200 pb-4"
        />

        {/* Data Table */}
        {!loading && !error && users.length > 0 && (
          <DataTable
            columns={columns}
            data={users}
            renderCell={renderCell}
          />
        )}

        {/* No data message */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerList