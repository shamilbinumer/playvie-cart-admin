import React from 'react'
import BreadCrumb from '../../layout/BreadCrumb'

const ProductForm = () => {
  return (
    <div>
        <BreadCrumb
        items={[
          { label: "Add Product", path: "#" },
        ]}
      />
    </div>
  )
}

export default ProductForm
