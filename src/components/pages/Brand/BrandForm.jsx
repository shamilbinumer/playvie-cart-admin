import React from 'react'
import BreadCrumb from '../../layout/BreadCrumb'
import { PageHeader } from '../../common/PageHeader'

const BrandForm = () => {
  return (
    <div>
      <BreadCrumb
        items={[
          { label: "Master Data", path: "#" },
          { label: "Brand List", path: "/master/brand-list" },
          { label: "Add Brand", path: "#" },
        ]}
      />
    </div>
  )
}

export default BrandForm
