import React, { useState } from 'react'
import BreadCrumb from '../layout/BreadCrumb'
import { useNavigate } from 'react-router-dom';
import DataTable from '../layout/DataTable';
import { PageHeader } from '../common/PageHeader';
import { Switch } from '@mui/material';

const UsersList = () => {
  const navigate = useNavigate();

  // ✅ Replace brands with users
  const [users, setUsers] = useState([
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

  // ✅ Update columns - removed actions, changed role to active/inactive toggle
  const columns = [
    { key: "index", title: "#" },
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "avatar", title: "Avatar" },
    { key: "status", title: "Active/Inactive" }
  ];

  // Handle toggle status
  const handleStatusToggle = (userId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: !user.status }
          : user
      )
    );
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
        <Switch
          checked={item.status}
          onChange={() => handleStatusToggle(item.id)}
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

  return (
    <div>
      <BreadCrumb
        items={[
          { label: "Users List", path: "#" },
        ]}
      />
      <PageHeader
        title="Users List"
        // description="Configure your application preferences"
        className="border-b border-gray-200 pb-4"
      />
      <DataTable
        columns={columns}
        data={users}
        renderCell={renderCell}
      />
    </div>
  )
}

export default UsersList