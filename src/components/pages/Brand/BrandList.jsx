import React, { useState } from 'react'
import { PageHeader } from '../../common/PageHeader'
import AddButton from '../../layout/AddButton'
import { useNavigate } from 'react-router-dom'
import BreadCrumb from '../../layout/BreadCrumb'
import DataTable from '../../layout/DataTable'
import { SquarePen, Trash2 } from 'lucide-react'

const BrandList = () => {
  const navigate = useNavigate();
   const [brands] = useState([
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
  const columns = [
    { key: 'index', title: '#' },
    { key: 'name', title: 'Name' },
    { key: 'status', title: 'Status' },
    { key: 'thumbnail', title: 'Thumbnail' },
    { key: 'actions', title: 'Actions' }
  ];
  const handleEdit = (category) => {
   
  };

  const handleDelete = (category) => {
   
  };
  // Action configuration
  const actions = [
    {
      label: 'Edit',
      handler: handleEdit,
      icon: SquarePen
    },
    {
      label: 'Delete',
      handler: handleDelete,
      icon: Trash2
    }
  ];
  return (
    <div className=''>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Brand List", path: "#" },
        ]}
      />
      <PageHeader
        title="Brand List"
        // description="Configure your application preferences"
        className="border-b border-gray-200 pb-4"
        actionButton={<AddButton title="Create New" onClick={() => navigate('/master/add-brand')} />}
      />
      <DataTable
        columns={columns}
        data={brands}
        actions={actions}
      />
    </div>
  )
}

export default BrandList
