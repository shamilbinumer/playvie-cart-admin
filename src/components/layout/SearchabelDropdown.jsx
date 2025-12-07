import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Searchable Dropdown Component
const SearchableDropdown = ({ 
  label, 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Search and select...',
  error = '',
  disabled = false,
  required = false,
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);
  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [];
  const selectedOptions = multiple 
    ? options.filter(opt => selectedValues.includes(opt.value))
    : [];

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
      setSearchTerm('');
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange?.(multiple ? [] : '');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== optionValue);
    onChange?.(newValues);
  };

  const displayValue = () => {
    if (multiple) {
      return selectedOptions.length > 0 
        ? `${selectedOptions.length} selected` 
        : '';
    }
    return selectedOption?.label || '';
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? searchTerm : displayValue()}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={handleInputClick}
            onFocus={handleInputClick}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            } ${
              disabled 
                ? 'bg-gray-100 cursor-not-allowed' 
                : 'bg-white hover:border-gray-400'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {((multiple && selectedValues.length > 0) || selectedOption) && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Selected tags for multiple select */}
        {multiple && selectedOptions.length > 0 && !isOpen && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {option.label}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(e, option.value)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
        
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">
                {searchTerm ? `No results for "${searchTerm}"` : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple 
                  ? selectedValues.includes(option.value)
                  : value === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'text-gray-900'
                    }`}
                  >
                    <span>{option.label}</span>
                    {multiple && isSelected && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SearchableDropdown

// // Demo Component
// export default function App() {
//   const [singleValue, setSingleValue] = useState('');
//   const [multipleValue, setMultipleValue] = useState([]);

//   const countries = [
//     { value: 'us', label: 'United States' },
//     { value: 'uk', label: 'United Kingdom' },
//     { value: 'ca', label: 'Canada' },
//     { value: 'au', label: 'Australia' },
//     { value: 'de', label: 'Germany' },
//     { value: 'fr', label: 'France' },
//     { value: 'jp', label: 'Japan' },
//     { value: 'in', label: 'India' },
//     { value: 'br', label: 'Brazil' },
//     { value: 'mx', label: 'Mexico' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-2xl mx-auto space-y-8">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h1 className="text-2xl font-bold text-gray-900 mb-6">
//             Searchable Dropdown Demo
//           </h1>
          
//           <div className="space-y-6">
//             {/* Single Select */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Single Select
//               </h2>
//               <SearchableDropdown
//                 label="Select Country"
//                 options={countries}
//                 value={singleValue}
//                 onChange={setSingleValue}
//                 placeholder="Search for a country..."
//                 required
//               />
//               <p className="mt-2 text-sm text-gray-600">
//                 Selected: {singleValue || 'None'}
//               </p>
//             </div>

//             {/* Multiple Select */}
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Multiple Select
//               </h2>
//               <SearchableDropdown
//                 label="Select Countries"
//                 options={countries}
//                 value={multipleValue}
//                 onChange={setMultipleValue}
//                 placeholder="Search and select multiple countries..."
//                 multiple
//                 required
//               />
//               <p className="mt-2 text-sm text-gray-600">
//                 Selected: {multipleValue.length > 0 ? multipleValue.join(', ') : 'None'}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }