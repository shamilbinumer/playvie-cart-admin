import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment, addDoc, query, orderBy, limit, startAfter, where, runTransaction, serverTimestamp } from 'firebase/firestore';
import BreadCrumb from '../../layout/BreadCrumb';
import { Package, Plus, Minus, Search, AlertTriangle, TrendingDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../../../firebase';
import Swal from 'sweetalert2';
import Preloader from '../../common/Preloader';
import { Modal, Box } from '@mui/material';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingProducts, setUpdatingProducts] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockChange, setStockChange] = useState('');
    const [changeType, setChangeType] = useState('add');
    const [updating, setUpdating] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [lastVisible, setLastVisible] = useState(null);
    const [firstVisible, setFirstVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    // Stats states
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);

    const swalConfig = {
    customClass: {
        container: 'swal-high-zindex'
    }
};

    useEffect(() => {
        fetchStats();
        fetchProducts();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setCurrentPage(1);
                fetchProducts();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchStats = async () => {
        try {
            const productsRef = collection(db, 'products');
            const snapshot = await getDocs(productsRef);
            const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setTotalProducts(allProducts.length);
            setLowStockCount(allProducts.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length);
            setOutOfStockCount(allProducts.filter(p => (p.stock || 0) === 0).length);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchProducts = async (direction = 'initial') => {
        try {
            setLoading(true);
            setIsSearching(false);
            const productsRef = collection(db, 'products');
            
            let q;
            
            if (direction === 'next' && lastVisible) {
                q = query(
                    productsRef,
                    orderBy('productName'),
                    startAfter(lastVisible),
                    limit(itemsPerPage)
                );
            } else if (direction === 'prev' && firstVisible) {
                // For previous page, we need to fetch in reverse
                q = query(
                    productsRef,
                    orderBy('productName'),
                    limit(itemsPerPage)
                );
            } else {
                // Initial load
                q = query(
                    productsRef,
                    orderBy('productName'),
                    limit(itemsPerPage)
                );
            }

            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                setProducts([]);
                setHasMore(false);
                return;
            }

            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setProducts(productsData);
            setFirstVisible(snapshot.docs[0]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === itemsPerPage);

        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch products'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchProducts();
            return;
        }

        try {
            setLoading(true);
            setIsSearching(true);
            const productsRef = collection(db, 'products');
            
            // Create search query - Firebase requires exact matches or prefix searches
            // For better search, consider using a search service like Algolia
            const searchLower = searchTerm.toLowerCase();
            const searchUpper = searchTerm.toUpperCase();
            
            // Get all products and filter client-side for now
            // For production, implement proper search indexing
            const snapshot = await getDocs(productsRef);
            const allProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const filtered = allProducts.filter(product => {
                const name = (product.productName || product.name || product.title || '').toLowerCase();
                return name.includes(searchTerm.toLowerCase());
            });

            setProducts(filtered);
            setHasMore(false); // Disable pagination during search
            
        } catch (error) {
            console.error('Error searching products:', error);
            Swal.fire({
                ...swalConfig,
                icon: 'error',
                title: 'Search Error',
                text: 'Failed to search products'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (hasMore && !isSearching) {
            setCurrentPage(prev => prev + 1);
            fetchProducts('next');
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1 && !isSearching) {
            setCurrentPage(prev => prev - 1);
            fetchProducts('prev');
        }
    };

  const handleStockChange = async (product, changeType) => {
    const changeAmount = changeType === 'add' ? 1 : -1;

    try {
        setUpdatingProducts(prev => ({ ...prev, [product.id]: true }));

        // 🔒 Use transaction for atomic read-check-write
        const newStock = await runTransaction(db, async (transaction) => {
            const productRef = doc(db, "products", product.id);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists()) {
                throw new Error("Product not found");
            }

            const currentStock = Number(productSnap.data().stock) || 0;
            const calculatedNewStock = currentStock + changeAmount;

            // ✅ Validate BEFORE updating
            if (calculatedNewStock < 0) {
                throw new Error("Stock cannot be negative");
            }

            transaction.update(productRef, {
                stock: calculatedNewStock  // Use direct value, not increment
            });

            return calculatedNewStock;
        });

        // Update local state with the actual new stock value from transaction
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === product.id 
                    ? { ...p, stock: newStock } 
                    : p
            )
        );

        await fetchStats();

        Swal.fire({
            ...swalConfig,
            icon: "success",
            title: "Stock Updated",
            text: `Stock ${changeType === 'add' ? 'increased' : 'decreased'} by 1`,
            timer: 1000,
            showConfirmButton: false,
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        
        let errorMessage = "Failed to update stock. Please try again.";
        if (error.message === "Stock cannot be negative") {
            errorMessage = "Not enough stock to remove!";
        }
        
        Swal.fire({
            ...swalConfig,
            icon: "error",
            title: "Update Failed",
            text: errorMessage
        });
    } finally {
        setUpdatingProducts(prev => ({ ...prev, [product.id]: false }));
    }
};

   const handleBulkStockUpdate = async () => {
    if (!selectedProduct || !stockChange || stockChange <= 0) {
        setSelectedProduct(null);
        setStockChange('');
        Swal.fire({
            icon: "warning",
            title: "Invalid Quantity",
            text: "Please enter a valid quantity!",
        });
        return;
    }

    try {
        setUpdating(true);
        const changeAmount = changeType === "add" 
            ? parseInt(stockChange) 
            : -parseInt(stockChange);

        // 🔒 Atomic transaction
        const newStock = await runTransaction(db, async (transaction) => {
            const productRef = doc(db, "products", selectedProduct.id);
            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists()) {
                throw new Error("Product not found");
            }

            const currentStock = productSnap.data().stock || 0;
            const calculatedNewStock = currentStock + changeAmount;

            // ✅ Server-side validation
            if (calculatedNewStock < 0) {
                throw new Error(
                    `Cannot remove ${Math.abs(changeAmount)} units. Only ${currentStock} available.`
                );
            }

            transaction.update(productRef, {
                stock: calculatedNewStock
            });

            // Log stock movement
            const movementRef = doc(collection(db, "stockMovements"));
            transaction.set(movementRef, {
                productId: selectedProduct.id,
                productName: selectedProduct.productName,
                changeType,
                quantity: parseInt(stockChange),
                previousStock: currentStock,
                newStock: calculatedNewStock,
                timestamp: serverTimestamp()
            });

            return calculatedNewStock;
        });

        // Update local state
        setProducts(
            products.map((p) =>
                p.id === selectedProduct.id 
                    ? { ...p, stock: newStock } 
                    : p
            )
        );

        await fetchStats();
        setSelectedProduct(null);
        setStockChange('');

        Swal.fire({
            ...swalConfig,
            icon: "success",
            title: "Stock Updated",
            text: "Stock updated successfully!",
            timer: 1500,
            showConfirmButton: false,
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        
        let errorMessage = "Failed to update stock. Please try again.";
        if (error.message.includes("Cannot remove")) {
            errorMessage = error.message;
        }
        
        Swal.fire({
            ...swalConfig,
            icon: "error",
            title: "Update Failed",
            text: errorMessage
        });
    } finally {
        setUpdating(false);
    }
};

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '80%', md: 700 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 0,
        maxHeight: '90vh',
        overflow: 'auto'
    };

    if (loading && products.length === 0) {
        return <Preloader />
    }

    return (
        <div className="">
            <BreadCrumb items={[{ label: "Inventory", path: "#" }]} />
            <div className="p-2">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-1">
                    <div className="bg-white px-6 py-3 rounded-lg border border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                            </div>
                            <Package className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                <div className="bg-white px-6 py-3 rounded-lg border border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                            </div>
                            <AlertTriangle className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>

                   <div className="bg-white px-6 py-3 rounded-lg border border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                            </div>
                            <TrendingDown className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Bulk Stock Update Modal */}
                <Modal
                    open={selectedProduct !== null}
                    onClose={() => {
                        setSelectedProduct(null);
                        setStockChange('');
                    }}
                    aria-labelledby="stock-update-modal"
                >
                    <Box sx={modalStyle}>
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Bulk Update: {selectedProduct?.name || selectedProduct?.title || selectedProduct?.productName}
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setStockChange('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                                    <div className="text-2xl font-bold text-gray-800">{selectedProduct?.stock || 0}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setChangeType('add')}
                                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${changeType === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Stock
                                        </button>
                                        <button
                                            onClick={() => setChangeType('remove')}
                                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${changeType === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            <Minus className="w-4 h-4" />
                                            Remove Stock
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={stockChange}
                                        onChange={(e) => setStockChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter quantity (e.g., 100, 1000)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={handleBulkStockUpdate}
                                disabled={updating}
                                className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium transition-colors"
                            >
                                {updating ? 'Updating...' : 'Update Stock'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setStockChange('');
                                }}
                                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </Box>
                </Modal>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                autoFocus
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {isSearching && (
                            <p className="text-sm text-gray-500 mt-2">
                                Showing search results for "{searchTerm}" ({products.length} found)
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Management</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product, index) => {
                                        const stock = product.stock || 0;
                                        const isLowStock = stock < 10 && stock > 0;
                                        const isOutOfStock = stock <= 0;
                                        const isUpdating = updatingProducts[product.id];
                                        const displayIndex = isSearching ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 whitespace-nowrap text-sm text-gray-800">
                                                    {displayIndex}
                                                </td>

                                                <td className="px-6 py-0.5 whitespace-nowrap">
                                                    <img
                                                        src={product.image || product.thumbnail || "https://via.placeholder.com/50"}
                                                        alt="thumbnail"
                                                        className="w-8 h-8 rounded object-cover border"
                                                    />
                                                </td>

                                                <td className="px-6 py-0.5 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {product.productName || "Unnamed Product"}
                                                </td>

                                                <td className="px-6 py-0.5 whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleStockChange(product, 'remove')}
                                                            disabled={isUpdating || stock <= 0}
                                                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        
                                                        <div className="w-16 text-center">
                                                            <span className="text-lg font-bold text-gray-800">
                                                                {isUpdating ? '...' : stock}
                                                            </span>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => handleStockChange(product, 'add')}
                                                            disabled={isUpdating}
                                                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setSelectedProduct(product)}
                                                            disabled={isUpdating}
                                                            className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Bulk
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-2 whitespace-nowrap">
                                                    {isOutOfStock ? (
                                                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Out of Stock
                                                        </span>
                                                    ) : isLowStock ? (
                                                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!isSearching && (
                        <div className="px-6 py-4 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{currentPage}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={!hasMore}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;