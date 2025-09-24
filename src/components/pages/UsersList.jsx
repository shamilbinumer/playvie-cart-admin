import React, { useState } from 'react'
import BreadCrumb from '../layout/BreadCrumb'
import { useNavigate } from 'react-router-dom';
import { SquarePen, Trash2 } from 'lucide-react';
import DataTable from '../layout/DataTable';

const UsersList = () => {
  const navigate = useNavigate();

  // ✅ Replace brands with users
  const [users] = useState([
    {
      id: 1,
      name: "Nabeel",
      email: "nabeel@example.com",
      role: "Admin",
      status: true,
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Bushra",
      email: "bushra@example.com",
      role: "Editor",
      status: false,
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      name: "Mohammed",
      email: "mohammed@example.com",
      role: "User",
      status: true,
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      id: 4,
      name: "Sabith",
      email: "sabith@example.com",
      role: "User",
      status: false,
      avatar: "https://i.pravatar.cc/150?img=4"
    }
  ]);

  // ✅ Update columns for users
  const columns = [
    { key: "index", title: "#" },
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "role", title: "Role" },
    { key: "status", title: "Status" },
    { key: "avatar", title: "Avatar" },
    { key: "actions", title: "Actions" }
  ];

  const handleEdit = (user) => {
    console.log("Edit user:", user);
    // navigate(`/users/edit/${user.id}`);
  };

  const handleDelete = (user) => {
    console.log("Delete user:", user);
    // API call to delete user
  };
const renderCell = (item, column, index) => {
    if (column.key === "index") return index + 1;

    if (column.key === "avatar") {
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

    if (column.key === "status") {
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
  // ✅ Action configuration
  const actions = [
    {
      label: "Edit",
      handler: handleEdit,
      icon: SquarePen
    },
    {
      label: "Delete",
      handler: handleDelete,
      icon: Trash2
    }
  ];
  return (
    
    <div>
      <BreadCrumb
          items={[
            { label: "Users List", path: "#" },
          ]}
        />
         <DataTable
          columns={columns}
          data={users}
          actions={actions}
          renderCell={renderCell}
        />
    </div>
    
  )
}

export default UsersList