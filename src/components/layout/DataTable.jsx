import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({ 
  columns, 
  data, 
  actions, 
  renderCell, 
  pagination = true, 
  itemsPerPage = 10,
  customPagination = null // For external pagination (like Firebase)
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Use custom pagination if provided, otherwise use internal pagination
  const isExternalPagination = customPagination !== null;
  
  const activePage = isExternalPagination ? customPagination.currentPage : currentPage;
  const totalPages = isExternalPagination 
    ? customPagination.totalPages 
    : Math.ceil(data.length / itemsPerPage);
  const totalItems = isExternalPagination 
    ? customPagination.totalItems 
    : data.length;
  const activeItemsPerPage = isExternalPagination 
    ? customPagination.itemsPerPage 
    : itemsPerPage;

  // Calculate pagination values
  const startIndex = (activePage - 1) * activeItemsPerPage;
  const endIndex = startIndex + activeItemsPerPage;
  
  // For external pagination, use data as-is (already paginated)
  // For internal pagination, slice the data
  const currentData = isExternalPagination || !pagination 
    ? data 
    : data.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (isExternalPagination) {
      customPagination.onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const goToPreviousPage = () => {
    if (activePage > 1) {
      goToPage(activePage - 1);
    }
  };

  const goToNextPage = () => {
    if (activePage < totalPages) {
      goToPage(activePage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (activePage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activePage - 1);
        pages.push(activePage);
        pages.push(activePage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const showPagination = pagination || isExternalPagination;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id || startIndex + index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-2 whitespace-nowrap text-sm text-gray-900"
                    >
                      {renderCell
                        ? renderCell(item, column, index)
                        : item[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {showPagination && totalItems > 0 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          {/* Results info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={activePage === 1}
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activePage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={activePage === totalPages}
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;