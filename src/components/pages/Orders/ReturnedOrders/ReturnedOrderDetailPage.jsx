import React, { useState } from 'react'
import BreadCrumb from '../../../layout/BreadCrumb'
import { PageHeader } from '../../../common/PageHeader'
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { CheckCircle, XCircle, Package, MapPin, DollarSign, AlertCircle, ArrowLeft } from 'lucide-react';

const ReturnedOrderDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Order Status: 0=pending, 1=Accept, 2=Dispatch, 3=Shipped, 4=Delivered, 
    // 5=Rejected, 6=Return, 7=User canceled, 8=return Accepted, 9=return rejected, 
    // 10=return received, 11=refund completed
    const getStatusText = (status) => {
        const statuses = {
            0: 'Pending',
            1: 'Accepted',
            2: 'Dispatched',
            3: 'Shipped',
            4: 'Delivered',
            5: 'Rejected',
            6: 'Return',
            7: 'User Canceled',
            8: 'Return Accepted',
            9: 'Return Rejected',
            10: 'Return Received',
            11: 'Refund Completed'
        };
        return statuses[status] || 'Unknown';
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 8: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 9: return 'bg-rose-100 text-rose-800 border-rose-200';
            case 10: return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 11: return 'bg-teal-100 text-teal-800 border-teal-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!orderData?.orderId || !orderData?.returnOrderId) {
            setError('Order ID or Return Order ID not found');
            return;
        }

        const confirmMessage = newStatus === 8 
            ? 'Are you sure you want to accept this return request?' 
            : 'Are you sure you want to reject this return request?';

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Update the order status in orders collection
            const orderRef = doc(db, 'orders', orderData.orderId);
            await updateDoc(orderRef, {
                orderStatus: newStatus,
                updatedAt: new Date()
            });

            // Update the return order status in returnOrders collection
            const returnOrderRef = doc(db, 'returnOrders', orderData.returnOrderId);
            await updateDoc(returnOrderRef, {
                returnOrderStatus: newStatus,
                updatedAt: new Date()
            });

            alert(`Return request ${newStatus === 8 ? 'accepted' : 'rejected'} successfully!`);
            navigate('/orders/return-orders');
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!orderData) {
        return (
            <div>
                <BreadCrumb
                    items={[
                        { label: "Manage Orders", path: "#" },
                        { label: "Return Orders", path: "/orders/return-orders" },
                        { label: "Return Order Details", path: "#" }
                    ]} 
                />
                <PageHeader
                    title="Return Order Details"
                    className="border-b border-gray-200 pb-4"
                />
                <div className="p-6 max-w-md mx-auto mt-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                        <p className="text-red-800 font-medium">No order data found</p>
                        <button 
                            onClick={() => navigate('/orders/return-orders')}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Back to Return Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { productDetails, shippingAddress, returnAmount, reason, createdAt, returnOrderStatus } = orderData;

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                items={[
                    { label: "Manage Orders", path: "#" },
                    { label: "Return Orders", path: "/orders/return-orders" },
                    { label: "Return Order Details", path: "#" }
                ]} 
            />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <PageHeader
                        title="Return Order Details"
                        className="border-b-0 pb-0"
                    />
                    <button
                        onClick={() => navigate('/orders/return-orders')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Product and Return Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Info Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(returnOrderStatus)}`}>
                                    {getStatusText(returnOrderStatus)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Order ID</p>
                                    <p className="font-medium text-gray-900">{orderData.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Return Order ID</p>
                                    <p className="font-medium text-gray-900">{orderData.returnOrderId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Return Requested</p>
                                    <p className="font-medium text-gray-900">{formatDate(createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Return Amount</p>
                                    <p className="font-medium text-gray-900">₹{returnAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Details Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-600" />
                                Product Details
                            </h2>
                            <div className="flex gap-4">
                                <img 
                                    src={productDetails?.thumbnail} 
                                    alt={productDetails?.productName}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {productDetails?.productName}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {productDetails?.shortDescription}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Quantity:</span>
                                            <span className="ml-2 font-medium text-gray-900">{productDetails?.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Price:</span>
                                            <span className="ml-2 font-medium text-gray-900">₹{productDetails?.salesPrice}</span>
                                        </div>
                                        {productDetails?.size && (
                                            <div>
                                                <span className="text-gray-500">Size:</span>
                                                <span className="ml-2 font-medium text-gray-900">{productDetails.size}</span>
                                            </div>
                                        )}
                                        {productDetails?.color && (
                                            <div>
                                                <span className="text-gray-500">Color:</span>
                                                <span className="ml-2 font-medium text-gray-900">{productDetails.color}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Return Reason Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Return Reason</h2>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-amber-900 font-medium">{reason}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Address and Actions */}
                    <div className="space-y-6">
                        {/* Shipping Address Card */}
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-600" />
                                Shipping Address
                            </h2>
                            <div className="text-sm space-y-2">
                                <p className="font-semibold text-gray-900">
                                    {shippingAddress?.firstName} {shippingAddress?.lastName}
                                </p>
                                <p className="text-gray-600">{shippingAddress?.address}</p>
                                {shippingAddress?.apartment && (
                                    <p className="text-gray-600">{shippingAddress.apartment}</p>
                                )}
                                <p className="text-gray-600">
                                    {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.pincode}
                                </p>
                                <div className="pt-3 border-t border-gray-200 mt-3">
                                    <p className="text-gray-600 font-medium">
                                        <span className="text-gray-500">Phone:</span> {shippingAddress?.phone}
                                    </p>
                                    {shippingAddress?.email && (
                                        <p className="text-gray-600 mt-1">
                                            <span className="text-gray-500">Email:</span> {shippingAddress.email}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                        {shippingAddress?.addressType}
                                    </span>
                                    {shippingAddress?.default && (
                                        <span className="inline-block ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Return Amount Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-600">Refund Amount</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                ₹{returnAmount?.toLocaleString()}
                            </p>
                        </div>

                        {/* Action Buttons - Only show for Pending status */}
                        {returnOrderStatus === 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleUpdateStatus(8)}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {loading ? 'Processing...' : 'Accept Return'}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(9)}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        {loading ? 'Processing...' : 'Reject Return'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    This action will update both the order and return order status
                                </p>
                            </div>
                        )}

                        {/* Status Info - Show for non-pending statuses */}
                        {returnOrderStatus !== 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Return Status</h2>
                                <div className={`text-center py-4 px-6 rounded-lg border ${getStatusColor(returnOrderStatus)}`}>
                                    <p className="font-medium">
                                        {getStatusText(returnOrderStatus)}
                                    </p>
                                    <p className="text-xs mt-2 opacity-75">
                                        {returnOrderStatus === 8 && 'This return has been accepted'}
                                        {returnOrderStatus === 9 && 'This return has been rejected'}
                                        {returnOrderStatus === 10 && 'Return has been received'}
                                        {returnOrderStatus === 11 && 'Refund has been completed'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReturnedOrderDetailPage