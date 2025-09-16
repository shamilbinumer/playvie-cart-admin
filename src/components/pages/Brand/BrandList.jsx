import React from 'react'
import { PageHeader } from '../../common/PageHeader'
import AddButton from '../../layout/AddButton'
import { useNavigate } from 'react-router-dom'
import BreadCrumb from '../../layout/BreadCrumb'

const BrandList = () => {
  const navigate = useNavigate()
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
    </div>
  )
}

export default BrandList
