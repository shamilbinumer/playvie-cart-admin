import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import BreadCrumb from '../../layout/BreadCrumb'
import { PageHeader } from '../../common/PageHeader'
import { db } from '../../../firebase'

const OrderDetails = () => {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    const orderStatuses = [
        { value: 0, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 1, label: 'Accept', color: 'bg-blue-100 text-blue-800' },
        { value: 2, label: 'Dispatch', color: 'bg-purple-100 text-purple-800' },
        { value: 3, label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
        { value: 4, label: 'Delivered', color: 'bg-green-100 text-green-800' },
        { value: 5, label: 'Rejected', color: 'bg-red-100 text-red-800' },
        { value: 6, label: 'Return', color: 'bg-orange-100 text-orange-800' },
        { value: 7, label: 'User Canceled', color: 'bg-gray-100 text-gray-800' }
    ]

    useEffect(() => {
        fetchOrderDetails()
    }, [orderId])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const orderRef = doc(db, 'orders', orderId)
            const orderSnap = await getDoc(orderRef)
            
            if (orderSnap.exists()) {
                setOrder({ id: orderSnap.id, ...orderSnap.data() })
            } else {
                console.error('Order not found')
            }
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    // Check if status is locked (final state)
    const isStatusLocked = (status) => {
        return status === 4 || status === 7
    }

    const handleStatusChange = async (newStatus) => {
        // Prevent status change if current status is locked
        if (isStatusLocked(order.orderStatus)) {
            alert('Cannot change status. Order has been completed or canceled.')
            return
        }

        try {
            setUpdating(true)
            const orderRef = doc(db, 'orders', orderId)
            
            // Prepare update data
            const updateData = {
                orderStatus: newStatus
            }
            
            // If status is "Delivered" (value 4), set paid to true
            if (newStatus === 4) {
                updateData.paid = true
            }
            
            await updateDoc(orderRef, updateData)
            setOrder(prev => ({ ...prev, ...updateData }))
        } catch (error) {
            console.error('Error updating order status:', error)
            alert('Failed to update order status')
        } finally {
            setUpdating(false)
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusInfo = (status) => {
        return orderStatuses.find(s => s.value === status) || orderStatuses[0]
    }

    if (loading) {
        return (
            <div>
                <BreadCrumb items={[
                    { label: "Order List", path: "#" },
                    { label: `Order Details`, path: "#" }
                ]} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading order details...</div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div>
                <BreadCrumb items={[
                    { label: "Order List", path: "#" },
                    { label: `Order Details`, path: "#" }
                ]} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Order not found</div>
                </div>
            </div>
        )
    }

    const currentStatus = getStatusInfo(order.orderStatus)
    const statusLocked = isStatusLocked(order.orderStatus)

    return (
        <div className="">
            <BreadCrumb items={[
                { label: "Order List", path: "/orders" },
                { label: `Order Details ${order.orderId}`, path: "#" }
            ]} />
            <PageHeader
                title={`Order ${order.orderId}`}
                className="border-b border-gray-200 pb-4"
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 p-2">
                {/* Order Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                                {currentStatus.label}
                            </span>
                           <select
                                value={order.orderStatus}
                                onChange={(e) => handleStatusChange(Number(e.target.value))}
                                disabled={updating || statusLocked}
                                className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    statusLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            >
                                {orderStatuses
                                    .filter(status => status.value !== 6 && status.value !== 7)
                                    .map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                            </select>
                            {updating && <span className="text-sm text-gray-500">Updating...</span>}
                            {statusLocked && (
                                <span className="text-sm text-gray-500 italic">
                                    (Status locked)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Products</h3>
                        <div className="space-y-4">
                            {order.products?.map((product, index) => (
                                <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0">
                                    <img
                                        src={product.thumbnail}
                                        alt={product.productName}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                                        <p className="text-sm text-gray-500">SKU: {product.skuCode}</p>
                                        <p className="text-sm text-gray-500">Brand: {product.brandName}</p>
                                        <p className="text-sm text-gray-500">Category: {product.categoryName}</p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-900">₹{product.salesPrice}</span>
                                            {product.mrp !== product.salesPrice && (
                                                <span className="text-sm text-gray-500 line-through">₹{product.mrp}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                        {order.shippingAddress && (
                            <div className="text-gray-700 space-y-1">
                                <p className="font-medium">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.apartment}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                                {order.shippingAddress.email && (
                                    <p>Email: {order.shippingAddress.email}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-medium">{order.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Type:</span>
                                <span className="font-medium capitalize">{order.orderType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Date:</span>
                                <span className="font-medium">{formatDate(order.orderDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Date:</span>
                                <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`font-medium ${order.paid ? 'text-green-600' : 'text-red-600'}`}>
                                    {order.paid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Price Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping:</span>
                                <span>₹{order.shipping}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-semibold text-base">
                                <span>Total Amount:</span>
                                <span className="text-blue-600">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails