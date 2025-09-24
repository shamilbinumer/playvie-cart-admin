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
    required = false
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

    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(true);
        setSearchTerm('');
      }
    };

    const handleOptionSelect = (optionValue) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    };

    const handleClear = () => {
      onChange?.('');
      setSearchTerm('');
      inputRef.current?.focus();
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
              value={isOpen ? searchTerm : (selectedOption?.label || '')}
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
              {selectedOption && !disabled ? (
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
          
          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 ${
                      value === option.value 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
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
  export default SearchableDropdown;