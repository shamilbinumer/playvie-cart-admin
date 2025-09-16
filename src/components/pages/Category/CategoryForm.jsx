import React from 'react'
import BreadCrumb from '../../layout/BreadCrumb'

const CategoryForm = () => {
  return (
    <div>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Category List", path: "/master/category-list" },
          { label: "Add Category", path: "#" },
        ]}
      />
    </div>
  )
}

export default CategoryForm
