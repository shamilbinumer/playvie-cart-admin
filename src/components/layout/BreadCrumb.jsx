import React from 'react'
import { ChevronRight, Home, ChevronLeft, Undo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BreadCrumb = ({ items = [], showHome = true, showBack = true, separator = "chevron", className = "" }) => {
  // Default home item
  const homeItem = { label: "Home", path: "/" }
  const navigate = useNavigate() 
  
  
  // Combine home with provided items if showHome is true
  const breadcrumbItems = showHome ? [homeItem, ...items] : items
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }
  
  // Render separator based on type
  const renderSeparator = () => {
    if (separator === "chevron") {
      return <ChevronRight className="w-4 h-4 text-gray-400" />
    }
    if (separator === "slash") {
      return <span className="text-gray-400">/</span>
    }
    if (separator === "arrow") {
      return <span className="text-gray-400">→</span>
    }
    return <ChevronRight className="w-4 h-4 text-gray-400" />
  }
  
  return (
    <nav className={`flex items-center space-x-2 px-2 text-sm ${className} pt-2`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {/* Back Button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}
        
        {/* Breadcrumb Items */}
        <ol className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mr-2">{renderSeparator()}</span>}
              
              {item.path && index < breadcrumbItems.length - 1 ? (
                // Clickable link for non-last items with path
                <a 
                  href={item.path} 
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    // Handle navigation here - you can replace this with your router
                    navigate(item.path)
                  }}
                >
                  {index === 0 && showHome && item.label === "Home" ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    item.label
                  )}
                </a>
              ) : (
                // Non-clickable current page or items without path
                <span className={`${index === breadcrumbItems.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'} flex items-center`}>
                  {index === 0 && showHome && item.label === "Home" ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

export default BreadCrumb