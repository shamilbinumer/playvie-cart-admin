import React, { useState } from 'react'
import BreadCrumb from '../../layout/BreadCrumb';
import { PageHeader } from '../../common/PageHeader';
import AddButton from '../../layout/AddButton';
import DataTable from '../../layout/DataTable';
import { SquarePen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
   const navigate = useNavigate();
   const [brands] = useState([
      {
        id: 1,
        productName: "Electronics",
        status: "Active",
        image: "https://fastly.picsum.photos/id/19/200/300.jpg?hmac=znGSIxHtiP0JiLTKW6bT7HlcfagMutcHfeZyNkglQFM"
      },
      {
        id: 2,
        productName: "Clothing",
        status: "Active",
        image: 'https://fastly.picsum.photos/id/19/200/300.jpg?hmac=znGSIxHtiP0JiLTKW6bT7HlcfagMutcHfeZyNkglQFM'
      },
      {
        id: 3,
        productName: "Books",
        status: "Inactive",
        image: "https://fastly.picsum.photos/id/19/200/300.jpg?hmac=znGSIxHtiP0JiLTKW6bT7HlcfagMutcHfeZyNkglQFM"
      },
      {
        id: 4,
        productName: "Home & Garden",
        status: "Active",
        image: "https://fastly.picsum.photos/id/19/200/300.jpg?hmac=znGSIxHtiP0JiLTKW6bT7HlcfagMutcHfeZyNkglQFM"
      }
    ]);
  const columns = [
    { key: 'index', title: '#' },
    { key: 'productName', title: 'Product Name' },
    { key: 'status', title: 'Status' },
    { key: 'image', title: 'Image' },
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
          { label: "Product List", path: "#" },
        ]}
      />
      <PageHeader
        title="Product List"
        // description="Configure your application preferences"
        className="border-b border-gray-200 pb-4"
        actionButton={<AddButton title="Create New" onClick={() => navigate('/add-product')} />}
      />
      <DataTable
        columns={columns}
        data={brands}
        actions={actions}
      />
    </div>
  )
}

export default ProductList
