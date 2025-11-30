import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment, addDoc, query, orderBy, limit } from 'firebase/firestore';
import BreadCrumb from '../../layout/BreadCrumb';
import { Package, Plus, Minus, Search, AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { db } from '../../../firebase';
import Swal from 'sweetalert2';
import Preloader from '../../common/Preloader';
import { Modal, Box } from '@mui/material';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockChange, setStockChange] = useState('');
    const [changeType, setChangeType] = useState('add');
    const [reason, setReason] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productsRef = collection(db, 'products');
            const snapshot = await getDocs(productsRef);
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async () => {
        if (!selectedProduct || !stockChange || stockChange <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Quantity",
                text: "Please enter a valid quantity!",
            });
            return;
        }

        try {
            setUpdating(true);
            const productRef = doc(db, "products", selectedProduct.id);
            const changeAmount =
                changeType === "add" ? parseInt(stockChange) : -parseInt(stockChange);

            // Prevent negative stock
            if (changeType === "remove" && selectedProduct.stock + changeAmount < 0) {
                Swal.fire({
                    icon: "error",
                    title: "Not Enough Stock",
                    text: "Cannot remove more stock than available!",
                });
                return;
            }

            // Update product stock
            await updateDoc(productRef, {
                stock: increment(changeAmount),
            });

            // Log stock movement
            await addDoc(collection(db, "stockMovements"), {
                productId: selectedProduct.id,
                productName: selectedProduct.productName,
                changeType,
                quantity: parseInt(stockChange),
                previousStock: selectedProduct.stock,
                newStock: selectedProduct.stock + changeAmount,
                timestamp: new Date(),
            });

            // Update UI
            setProducts(
                products.map((p) =>
                    p.id === selectedProduct.id ? { ...p, stock: p.stock + changeAmount } : p
                )
            );

            // Reset
            setSelectedProduct(null);
            setStockChange('');

            Swal.fire({
                icon: "success",
                title: "Stock Updated",
                text: "Stock updated successfully!",
                timer: 1500,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Error updating stock:", error);

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: "Failed to update stock. Please try again.",
            });

        } finally {
            setUpdating(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const name = product.name || product.title || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const lowStockProducts = products.filter(p => (p.stock || 0) < 10);
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);

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

    if (loading) {
        return <Preloader />
    }

    return (
        <div className="">
            <BreadCrumb items={[{ label: "Inventory", path: "#" }]} />
            <div className="p-2">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                            </div>
                            <Package className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Low Stock</p>
                                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
                            </div>
                            <AlertTriangle className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
                            </div>
                            <TrendingDown className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Stock Update Modal */}
                <Modal
                    open={selectedProduct !== null}
                    onClose={() => {
                        setSelectedProduct(null);
                        setStockChange('');
                    }}
                    aria-labelledby="stock-update-modal"
                >
                    <Box sx={modalStyle}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Update Stock: {selectedProduct?.name || selectedProduct?.title || selectedProduct?.productName}
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

                        {/* Modal Body */}
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
                                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${changeType === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Stock
                                        </button>
                                        <button
                                            onClick={() => setChangeType('remove')}
                                            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${changeType === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                                                }`}
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
                                        placeholder="Enter quantity"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={handleStockUpdate}
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
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-2 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product, index) => {
                                        const stock = product.stock || 0;
                                        const isLowStock = stock < 10 && stock > 0;
                                        const isOutOfStock = stock === 0;

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50">

                                                {/* Product ID */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                    {index + 1}
                                                </td>

                                                {/* Thumbnail */}
                                                <td className="px-6 py-2 whitespace-nowrap">
                                                    <img
                                                        src={product.image || product.thumbnail || "https://via.placeholder.com/50"}
                                                        alt="thumbnail"
                                                        className="w-12 h-12 rounded object-cover border"
                                                    />
                                                </td>

                                                {/* Product Name */}
                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {product.productName || "Unnamed Product"}
                                                </td>

                                                {/* Stock */}
                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {stock}
                                                </td>

                                                {/* Status */}
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

                                                {/* Actions */}
                                                <td className="px-6 py-2 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Manage Stock
                                                    </button>
                                                </td>

                                            </tr>

                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;