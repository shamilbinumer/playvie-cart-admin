import React, { useState, useEffect } from 'react'
import { PageHeader } from '../../common/PageHeader'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'
import BreadCrumb from '../../layout/BreadCrumb'
import Preloader from '../../common/Preloader'

const CustomerDetails = () => {
    const { customerName, customerId } = useParams()
    const [customer, setCustomer] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        if (customerId) {
            fetchCustomerData()
        }
    }, [customerId])

    const fetchCustomerData = async () => {
        try {
            setLoading(true)
            setError(null)

            const customerDoc = await getDoc(doc(db, 'users', customerId))
            if (!customerDoc.exists()) {
                setError('Customer not found')
                setLoading(false)
                return
            }

            setCustomer({ id: customerDoc.id, ...customerDoc.data() })

            const ordersQuery = query(
                collection(db, 'orders'),
                where('userId', '==', customerId)
            )

            const ordersSnapshot = await getDocs(ordersQuery)
            const ordersData = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            ordersData.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0)
                const dateB = b.date ? new Date(b.date) : new Date(0)
                return dateB - dateA
            })

            setOrders(ordersData)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Failed to load customer data')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Preloader />
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                    {error}
                </div>
            </div>
        )
    }

    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0

    return (
        <div className="min-h-screen bg-gray-50">
            <BreadCrumb
                items={[
                    { label: "Users", path: "#" },
                    { label: "Customer List", path: "/users/customers" },
                    { label: "Customer Details", path: "#" },
                ]}
            />

            <div className="p-4">
                {/* Compact Header with Stats */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{customer?.firstName || 'N/A'}</h1>
                            <p className="text-sm text-gray-500">{customer?.email || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold" style={{ color: '#ac1f67' }}>₹{totalSpent.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{orders.length} orders</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                        <div>
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="text-sm font-medium text-gray-900">{customer?.phone || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Avg Order</div>
                            <div className="text-sm font-medium text-gray-900">₹{avgOrderValue.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Member Since</div>
                            <div className="text-sm font-medium text-gray-900">
                                {customer?.joinDate ? new Date(customer.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact Orders List */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold" style={{ color: '#ac1f67' }}>
                            Order History ({orders.length})
                        </h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            <svg className="mx-auto h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            No orders found
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    {/* Order Summary Row */}
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-gray-400">#{order.id.slice(-6)}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#ac1f67' }}>
                                                    {order.status || 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {order?.orderDate
                                                        ? order.orderDate.toDate().toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'}
                                                </span>

                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toFixed(2) || '0.00'}</div>
                                            </div>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Expandable Product Details */}
                                    {expandedOrder === order.id && order.products && order.products.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                            {order.products.map((product, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{product.productName || `Product ${idx + 1}`}</div>
                                                        {product.skuCode && (
                                                            <div className="text-xs text-gray-400">SKU: {product.skuCode}</div>
                                                        )}
                                                    </div>
                                                    <div className="text-right ml-3">
                                                        <div className="font-semibold text-gray-900">₹{Number(product.salesPrice).toFixed(2)}</div>
                                                        <div className="text-xs text-gray-500">Qty: {product.quantity || 1}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.notes && (
                                                <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded mt-2">
                                                    <span className="font-medium">Note:</span> {order.notes}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CustomerDetails