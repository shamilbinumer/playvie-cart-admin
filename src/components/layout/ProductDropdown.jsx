import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";

const ProductDropdown = ({ 
  label, 
  value = [], 
  onChange, 
  error = '',
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadInitialProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products from Firestore
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchTerm);
      }, 500);
    } else {
      setFilteredProducts(products);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, products]);

  const loadInitialProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('productName'), limit(10));
      const snapshot = await getDocs(q);
      
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(productsList);
      

      setProducts(productsList);
      setFilteredProducts(productsList);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setLoading(false);
  };

  const loadMoreProducts = async () => {
    if (!lastDoc || !hasMore || loading) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'products'), 
        orderBy('productName'),
        startAfter(lastDoc), 
        limit(10)
      );
      const snapshot = await getDocs(q);
      
      const newProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const updatedProducts = [...products, ...newProducts];
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading more products:', error);
    }
    setLoading(false);
  };

  const searchProducts = async (term) => {
    setSearchLoading(true);
    try {
      const searchTermLower = term.toLowerCase();
      const q = query(
        collection(db, 'products'),
        where('productName', '>=', searchTermLower),
        where('productName', '<=', searchTermLower + '\uf8ff'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const searchResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFilteredProducts(searchResults);
    } catch (error) {
      console.error('Error searching products:', error);
      const filtered = products.filter(p => 
        p.productName?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    setSearchLoading(false);
  };

  const handleProductToggle = (productId) => {
    const newValue = value.includes(productId)
      ? value.filter(id => id !== productId)
      : [...value, productId];
    onChange(newValue);
  };

  const handleRemoveProduct = (e, productId) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== productId));
  };

  const selectedProducts = products.filter(p => value.includes(p.id));

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm cursor-pointer transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
          } bg-white`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700">
              {value.length > 0 ? `${value.length} products selected` : 'Select products...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProducts.map((product) => (
              <span
                key={product.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {product.productName}
                <button
                  type="button"
                  onClick={(e) => handleRemoveProduct(e, product.id)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading && products.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? `No products found for "${searchTerm}"` : 'No products available'}
                </div>
              ) : (
                <>
                  {filteredProducts.map((product) => {
                    const isSelected = value.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductToggle(product.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between border-b border-gray-100 ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.productName}</div>
                          {product.salesPrice && (
                            <div className="text-sm text-gray-500">₹{product.salesPrice}</div>
                          )}
                        </div>
                        {isSelected && (
                          <span className="text-blue-600 font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                  
                  {!searchTerm && hasMore && (
                    <button
                      type="button"
                      onClick={loadMoreProducts}
                      disabled={loading}
                      className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-150 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Products'
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ProductDropdown