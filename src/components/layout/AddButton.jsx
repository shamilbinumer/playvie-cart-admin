import React from 'react'

const AddButton = ({title,onClick}) => {
  return (
    <div>
      <button className='bg-[#ac1f67] text-white px-4 py-1 rounded-md' onClick={onClick}>{title}</button>
    </div>
  )
}

export default AddButton
