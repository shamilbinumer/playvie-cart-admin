import React, { useState, useEffect, useRef } from 'react'
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
    const [printFormat, setPrintFormat] = useState('a4')
    const [showPrintDropdown, setShowPrintDropdown] = useState(false)
    const dropdownRef = useRef(null)

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowPrintDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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

    const isStatusLocked = (status) => {
        return status === 4 || status === 7
    }

    const handleStatusChange = async (newStatus) => {
        if (isStatusLocked(order.orderStatus)) {
            alert('Cannot change status. Order has been completed or canceled.')
            return
        }

        try {
            setUpdating(true)
            const orderRef = doc(db, 'orders', orderId)

            const updateData = {
                orderStatus: newStatus
            }

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

    const handlePrint = () => {
        if (printFormat === 'a4') {
            printA4()
        } else {
            printThermal()
        }
        setShowPrintDropdown(false)
    }

    const printA4 = () => {
        const printWindow = window.open('', '_blank')
        const currentStatus = getStatusInfo(order.orderStatus)

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order ${order.orderId}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 15px 25px; color: #333; font-size: 12px; }
                .company-header { text-align: center; margin-bottom: 12px; }
                .company-header h1 { font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 3px; }
                .company-header p { color: #666; font-size: 10px; line-height: 1.3; }
                .header { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
                .header h1 { font-size: 18px; margin: 0; }
                .header-info { text-align: right; font-size: 11px; color: #666; }
                .section { margin-bottom: 12px; }
                .section-title { font-size: 13px; font-weight: bold; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #ddd; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 15px; font-size: 11px; }
                .info-row { display: flex; justify-content: space-between; }
                .info-label { color: #666; }
                .info-value { font-weight: 600; }
                .product-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
                .product-table th { background-color: #f3f4f6; padding: 5px 8px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
                .product-table td { padding: 5px 8px; border: 1px solid #ddd; vertical-align: top; }
                .product-table .text-right { text-align: right; }
                .product-table .text-center { text-align: center; }
                .product-details { font-size: 10px; color: #666; margin-top: 2px; }
                .address-box { background: #f9f9f9; padding: 8px; border-radius: 3px; line-height: 1.5; font-size: 11px; }
                .price-summary { margin-top: 8px; }
                .price-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
                .total-row { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 6px; margin-top: 6px; }
                .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
                .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                @media print {
                    body { padding: 10px 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="company-header">
                <h1>Playvie Cart</h1>
                <p>Valiangadi, Perinthalmanna, Malappuram - 679322, Kerala | +91 9540301030 | info.playvie@gmail.com</p>
            </div>
            
            <div class="header">
                <h1>Order Invoice</h1>
                <div class="header-info">
                    <div><strong>Order ID:</strong> ${order.orderId}</div>
                    <div><strong>Date:</strong> ${formatDate(order.orderDate)}</div>
                </div>
            </div>

            <div class="info-grid" style="margin-bottom: 12px;">
                <div class="info-row">
                    <span class="info-label">Order Type:</span>
                    <span class="info-value">${order.orderType}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Method:</span>
                    <span class="info-value">${order.paymentMethod.toUpperCase()}</span>
                </div>
              
                <div class="info-row">
                    <span class="info-label">Delivery Date:</span>
                    <span class="info-value">${formatDate(order.deliveryDate)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="status-badge" style="background-color: ${currentStatus.color.includes('yellow') ? '#fef3c7' : currentStatus.color.includes('green') ? '#d1fae5' : currentStatus.color.includes('blue') ? '#dbeafe' : '#fee2e2'}; color: ${currentStatus.color.includes('yellow') ? '#92400e' : currentStatus.color.includes('green') ? '#065f46' : currentStatus.color.includes('blue') ? '#1e40af' : '#991b1b'}">
                        ${currentStatus.label}
                    </span>
                </div>
            </div>

           <div class="section">
    <div class="section-title">Product</div>
    <table class="product-table">
        <thead>
            <tr>
                <th style="width: 50%;">Product</th>
                <th style="width: 18%;">Price</th>
                <th class="text-center" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 22%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div style="font-weight: 600;">${order.productDetails.productName}</div>
                    <div class="product-details">SKU: ${order.productDetails.skuCode} | Brand: ${order.productDetails.brandName}</div>
                    ${order.productDetails.size ? `<div class="product-details">Size: ${order.productDetails.size}</div>` : ''}
                    ${order.productDetails.color ? `<div class="product-details">Color: ${order.productDetails.color}</div>` : ''}
                </td>
                <td>
                    <div>₹${order.productDetails.salesPrice}</div>
                    ${order.productDetails.mrp !== order.productDetails.salesPrice ? `<div style="font-size: 10px; color: #999; text-decoration: line-through;">₹${order.productDetails.mrp}</div>` : ''}
                </td>
                <td class="text-center">${order.productDetails.quantity}</td>
                <td class="text-right"><strong>₹${(order.productDetails.salesPrice * order.productDetails.quantity).toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
</div>

            <div class="two-column">
                <div class="section">
                    <div class="section-title">Shipping Address</div>
                    <div class="address-box">
                        <strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong><br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.apartment}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                        <strong>Phone:</strong> ${order.shippingAddress.phone}
                        ${order.shippingAddress.email ? `<br><strong>Email:</strong> ${order.shippingAddress.email}` : ''}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Price Summary</div>
                    <div class="price-summary">
                        <div class="price-row">
                            <span>Subtotal:</span>
                            <span>₹${order.subtotal}</span>
                        </div>
                        <div class="price-row">
                            <span>Shipping:</span>
                            <span>₹${order.shipping}</span>
                        </div>
                        <div class="price-row total-row">
                            <span>Total Amount:</span>
                            <span>₹${order.totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `)

        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    const printThermal = () => {
        const printWindow = window.open('', '_blank')
        const currentStatus = getStatusInfo(order.orderStatus)

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order ${order.orderId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    @page { size: 80mm auto; margin: 0; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        width: 80mm; 
                        padding: 10px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .company-header { text-align: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 2px dashed #000; }
                    .company-header .name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                    .company-header .details { font-size: 10px; line-height: 1.5; }
                    .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                    .header h1 { font-size: 18px; margin-bottom: 5px; }
                    .section { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
                    .section:last-child { border-bottom: 2px dashed #000; }
                    .row { display: flex; justify-content: space-between; margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                    table th { text-align: left; border-bottom: 1px solid #000; padding: 5px 2px; font-size: 11px; }
                    table td { padding: 5px 2px; border-bottom: 1px dotted #ccc; font-size: 11px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
                    @media print {
                        body { padding: 5px; }
                    }
                </style>
            </head>
            <body>
                <div class="company-header">
                    <div class="name">PLAYVIE CART</div>
                    <div class="details">
                        Valiangadi, Perinthalmanna<br>
                        Malappuram - 679322, Kerala<br>
                        +91 9540301030<br>
                        info.playvie@gmail.com
                    </div>
                </div>

                <div class="header center">
                    <h1 class="bold">ORDER INVOICE</h1>
                    <div>Order: ${order.orderId}</div>
                    <div>${new Date(order.orderDate.seconds * 1000).toLocaleDateString('en-IN')}</div>
                </div>

                <div class="section">
                    <div class="bold">STATUS: ${currentStatus.label.toUpperCase()}</div>
                    <div class="row">
                        <span>Type:</span>
                        <span>${order.orderType}</span>
                    </div>
                    <div class="row">
                        <span>Payment:</span>
                        <span>${order.paymentMethod.toUpperCase()}</span>
                    </div>
                 
                </div>

               <div class="section">
    <div class="bold" style="margin-bottom: 8px;">PRODUCT</div>
    <table>
        <thead>
            <tr>
                <th style="width: 45%;">Item</th>
                <th class="text-right" style="width: 25%;">Price</th>
                <th class="text-center" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="bold">${order.productDetails.productName}</div>
                    <div style="font-size: 10px;">${order.productDetails.skuCode}</div>
                    ${order.productDetails.size ? `<div style="font-size: 10px;">Size: ${order.productDetails.size}</div>` : ''}
                    ${order.productDetails.color ? `<div style="font-size: 10px;">Color: ${order.productDetails.color}</div>` : ''}
                </td>
                <td class="text-right">₹${order.productDetails.salesPrice}</td>
                <td class="text-center">${order.productDetails.quantity}</td>
                <td class="text-right"><strong>₹${(order.productDetails.salesPrice * order.productDetails.quantity).toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
</div>

                <div class="section">
                    <div class="bold" style="margin-bottom: 5px;">SHIP TO:</div>
                    <div>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</div>
                    <div>${order.shippingAddress.address}</div>
                    <div>${order.shippingAddress.apartment}</div>
                    <div>${order.shippingAddress.city}, ${order.shippingAddress.state}</div>
                    <div>${order.shippingAddress.pincode}</div>
                    <div>Ph: ${order.shippingAddress.phone}</div>
                </div>

                <div class="section">
                    <div class="row">
                        <span>Subtotal:</span>
                        <span>₹${order.subtotal}</span>
                    </div>
                    <div class="row">
                        <span>Shipping:</span>
                        <span>₹${order.shipping}</span>
                    </div>
                    <div class="row total">
                        <span>TOTAL:</span>
                        <span>₹${order.totalAmount}</span>
                    </div>
                </div>

                <div class="center" style="margin-top: 15px; font-size: 11px;">
                    Thank you for your order!
                </div>
            </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    if (loading) {
        return (
            <div>
                <BreadCrumb items={[
                    { label: "Manage Orders", path: "#" },
                    { label: "Order List", path: "/orders/order-list" },
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
                    { label: "Manage Orders", path: "#" },
                    { label: "Order List", path: "/orders/order-list" },
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
                { label: "Manage Orders", path: "#" },
                { label: "Order List", path: "/orders/order-list" },
                { label: `Order Details ${order.orderId}`, path: "#" }
            ]} />
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <PageHeader
                    title={`Order ${order.orderId}`}
                    className=""
                />
                <div className="flex items-center gap-2" ref={dropdownRef}>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowPrintDropdown(!showPrintDropdown)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showPrintDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                    onClick={() => {
                                        setPrintFormat('a4')
                                        setShowPrintDropdown(false)
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${printFormat === 'a4' ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <span>A4 Format</span>
                                    {printFormat === 'a4' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setPrintFormat('thermal')
                                        setShowPrintDropdown(false)
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${printFormat === 'thermal' ? 'bg-blue-50 text-blue-600' : ''}`}
                                >
                                    <span>Thermal (80mm)</span>
                                    {printFormat === 'thermal' && (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusLocked ? 'bg-gray-100 cursor-not-allowed' : ''
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
                    {/* Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Product</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 border-b pb-4">
                                <img
                                    src={order.productDetails.thumbnail}
                                    alt={order.productDetails.productName}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{order.productDetails.productName}</h4>
                                    <p className="text-sm text-gray-500">SKU: {order.productDetails.skuCode}</p>
                                    <p className="text-sm text-gray-500">Brand: {order.productDetails.brandName}</p>
                                    <p className="text-sm text-gray-500">Category: {order.productDetails.categoryName}</p>
                                    {order.productDetails.size && (
                                        <p className="text-sm text-gray-500">Size: {order.productDetails.size}</p>
                                    )}
                                    {order.productDetails.color && (
                                        <p className="text-sm text-gray-500">Color: {order.productDetails.color}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="text-sm text-gray-600">Quantity: {order.productDetails.quantity}</span>
                                        <span className="text-sm font-medium text-gray-900">₹{order.productDetails.salesPrice}</span>
                                        {order.productDetails.mrp !== order.productDetails.salesPrice && (
                                            <span className="text-sm text-gray-500 line-through">₹{order.productDetails.mrp}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
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