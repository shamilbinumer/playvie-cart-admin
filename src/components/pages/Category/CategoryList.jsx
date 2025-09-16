import React, { useState } from "react";
import BreadCrumb from "../../layout/BreadCrumb";
import DataTable from "../../layout/DataTable";
import AddButton from "../../layout/AddButton";
import { PageHeader } from "../../common/PageHeader";
import { useNavigate } from "react-router-dom";

const CategoryList = () => {
  const navigate = useNavigate()
  // Sample data - replace with your actual data source
  const [categories] = useState([
    {
      id: 1,
      name: "Electronics",
      status: "Active",
      thumbnail: "https://via.placeholder.com/50"
    },
    {
      id: 2,
      name: "Clothing",
      status: "Active",
      thumbnail: null
    },
    {
      id: 3,
      name: "Books",
      status: "Inactive",
      thumbnail: "https://via.placeholder.com/50"
    },
    {
      id: 4,
      name: "Home & Garden",
      status: "Active",
      thumbnail: null
    }
  ]);

  // Table columns configuration
  const columns = [
    { key: 'index', title: '#' },
    { key: 'name', title: 'Name' },
    { key: 'status', title: 'Status' },
    { key: 'thumbnail', title: 'Thumbnail' },
    { key: 'actions', title: 'Actions' }
  ];

  // Action handlers
  const handleEdit = (category) => {
    console.log('Edit category:', category);
    // Add your edit logic here
    alert(`Edit category: ${category.name}`);
  };

  const handleDelete = (category) => {
    console.log('Delete category:', category);
    // Add your delete logic here
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      alert(`Deleted category: ${category.name}`);
    }
  };

  // Action configuration
  const actions = [
    {
      label: 'Edit',
      handler: handleEdit,
      className: 'bg-blue-500 hover:bg-blue-600',
      icon: '✏️'
    },
    {
      label: 'Delete',
      handler: handleDelete,
      className: 'bg-red-500 hover:bg-red-600',
      icon: '🗑️'
    }
  ];

  return (
    <div className="px-2">
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Category List", path: "#" },
        ]}
      />

      <div className="mt-6">
        <PageHeader
          title="Category List"
          // description="Configure your application preferences"
          className="border-b border-gray-200 pb-4"
          actionButton={<AddButton title="Create New" onClick={()=>navigate('/master/add-category')} />}
        />

        <DataTable
          columns={columns}
          data={categories}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default CategoryList;