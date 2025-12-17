import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { menuData } from "../../utils/menuData";
import { useNavigate } from "react-router-dom";


// Menu data


// Search function to find menu items
const searchMenu = (query) => {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  menuData.forEach((item) => {
    // Check parent menu
    if (item.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        ...item,
        path: [item.title],
        isParent: true
      });
    }
    
    // Check children
    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => {
        if (child.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            ...child,
            path: [item.title, child.title],
            isParent: false
          });
        }
      });
    }
  });
  
  return results;
};

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchMenu(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };
const navigate = useNavigate()
  const handleResultClick = (url) => {
    navigate(url);
    // Add your navigation logic here
    // For example: navigate(url) or window.location.href = url
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setShowResults(true)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search menu items..."
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => {
                const IconComponent = result.icon;
                return (
                  <button
                    key={`${result.id}-${result.path.join('-')}`}
                    onClick={() => result.url && handleResultClick(result.url)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                      !result.url ? 'cursor-default opacity-60' : ''
                    }`}
                    disabled={!result.url}
                  >
                    {IconComponent && (
                      <IconComponent className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.path.join(' > ')}
                      </div>
                     
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No menu items found</p>
              <p className="text-xs mt-1">Try searching for "Dashboard", "Users", or "Orders"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}