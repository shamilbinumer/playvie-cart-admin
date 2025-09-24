import React, { useState } from 'react'
import BreadCrumb from '../layout/BreadCrumb'
import { useNavigate } from 'react-router-dom';
import { SquarePen, Trash2 } from 'lucide-react';

const UsersList = () => {
  const navigate = useNavigate();

  // ✅ Replace brands with users
  const [users] = useState([
    {
      id: 1,
      name: "Nabeel",
      email: "nabeel@example.com",
      role: "Admin",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Bushra",
      email: "bushra@example.com",
      role: "Editor",
      status: "Inactive",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      name: "Mohammed",
      email: "mohammed@example.com",
      role: "User",
      status: "Active",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      id: 4,
      name: "Sabith",
      email: "sabith@example.com",
      role: "User",
      status: "Active",
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
    </div>
  )
}

export default UsersList