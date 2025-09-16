import React from 'react';

const DataTable = ({ columns, data, actions }) => {
  const renderCellContent = (item, column, index) => {
    if (column.key === 'index') {
      return index + 1;
    }
    
    if (column.key === 'thumbnail' || column.key=== 'image') {
      return (
        <div className="w-15 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {item[column.key] ? (
            <img 
              src={item[column.key]} 
              alt="thumbnail" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      );
    }
    
    if (column.key === 'status') {
      return (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item[column.key] === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item[column.key]}
        </span>
      );
    }
    
    if (column.key === 'actions' && actions) {
      return (
        <div className="flex space-x-2">
          {actions.map((action, actionIndex) => (
            <button
              key={actionIndex}
              onClick={() => action.handler(item)}
              className={`flex items-center justify-center rounded transition-colors ${action.label==='Edit'?'text-green-600':''}  ${action.label==='Delete'?'text-red-600':''}`}
              disabled={action.disabled && action.disabled(item)}
            >
              {action.icon && <span className="mr-1 "><action.icon width={20}/></span>}
              {/* {action.label} */}
            </button>
          ))}
        </div>
      );
    }
    
    return item[column.key] || '-';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 whitespace-nowrap text-sm text-gray-900">
                    {renderCellContent(item, column, index)}
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
  );
};

export default DataTable;

