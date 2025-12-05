import React, { useEffect, useState } from 'react'
import BreadCrumb from '../../layout/BreadCrumb'
import { PageHeader } from '../../common/PageHeader'
import { Eye } from 'lucide-react'
import { collection, query, orderBy, limit, startAfter, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '../../../firebase'
import Preloader from '../../common/Preloader'
import ServerPaginatedDataTable from '../../layout/ServerPaginatedDataTable'
import { useNavigate } from 'react-router-dom'

const OrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [pageCache, setPageCache] = useState({});

    useEffect(() => {
        fetchTotalCount();
    }, []);

    useEffect(() => {
        fetchOrders(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage]);

    const fetchTotalCount = async () => {
        try {
            const orderRef = collection(db, "orders");
            const snapshot = await getCountFromServer(orderRef);
            setTotalOrders(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching total count:", error);
        }
    };

    const fetchOrders = async (page, perPage) => {
        // Create cache key
        const cacheKey = `${page}-${perPage}`;
        
        // Check if page is cached
        if (pageCache[cacheKey]) {
            setOrders(pageCache[cacheKey].orders);
            setInitialLoading(false);
            return;
        }

        setTableLoading(true);
        try {
            const orderRef = collection(db, "orders");
            let q;

            if (page === 1) {
                // First page query
                q = query(
                    orderRef,
                    orderBy("orderDate", "desc"),
                    limit(perPage)
                );
            } else {
                // Subsequent pages - use cached last document from previous page
                const prevCacheKey = `${page - 1}-${perPage}`;
                const prevPageCache = pageCache[prevCacheKey];
                
                if (prevPageCache && prevPageCache.lastVisible) {
                    q = query(
                        orderRef,
                        orderBy("orderDate", "desc"),
                        startAfter(prevPageCache.lastVisible),
                        limit(perPage)
                    );
                } else {
                    // If cache missing, fetch from beginning (fallback)
                    const skip = (page - 1) * perPage;
                    q = query(
                        orderRef,
                        orderBy("orderDate", "desc"),
                        limit(skip + perPage)
                    );
                    
                    const allDocs = await getDocs(q);
                    const slicedDocs = allDocs.docs.slice(-perPage);
                    
                    const orderData = slicedDocs.map((doc) => ({
                        ...doc.data(),
                        orderId: doc.id,
                        id: doc.id,
                    }));

                    // Cache the page data
                    setPageCache(prev => ({
                        ...prev,
                        [cacheKey]: {
                            orders: orderData,
                            firstVisible: slicedDocs[0],
                            lastVisible: slicedDocs[slicedDocs.length - 1]
                        }
                    }));

                    setOrders(orderData);
                    setTableLoading(false);
                    setInitialLoading(false);
                    return;
                }
            }

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setOrders([]);
                setTableLoading(false);
                setInitialLoading(false);
                return;
            }

            const docs = querySnapshot.docs;
            const orderData = docs.map((doc) => ({
                ...doc.data(),
                orderId: doc.id,
                id: doc.id,
            }));

            const firstDoc = docs[0];
            const lastDoc = docs[docs.length - 1];

            // Cache the page data
            setPageCache(prev => ({
                ...prev,
                [cacheKey]: {
                    orders: orderData,
                    firstVisible: firstDoc,
                    lastVisible: lastDoc
                }
            }));

            setOrders(orderData);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setTableLoading(false);
            setInitialLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when items per page changes
        setPageCache({}); // Clear cache when items per page changes
    };

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const getStatusLabel = (statusCode) => {
        const statusMap = {
            0: "Pending",
            1: "Accept",
            2: "Dispatch",
            3: "Shipped",
            4: "Delivered",
            5: "Rejected",
            6: "Return",
            7: "User Canceled"
        };
        return statusMap[statusCode] || "Unknown";
    };

    const getStatusColor = (statusCode) => {
        const colorMap = {
            0: "bg-yellow-100 text-yellow-800",
            1: "bg-blue-100 text-blue-800",
            2: "bg-purple-100 text-purple-800",
            3: "bg-indigo-100 text-indigo-800",
            4: "bg-green-100 text-green-800",
            5: "bg-red-100 text-red-800",
            6: "bg-orange-100 text-orange-800",
            7: "bg-gray-100 text-gray-800"
        };
        return colorMap[statusCode] || "bg-gray-100 text-gray-800";
    };

    const columns = [
        { key: "index", title: "#" },
        { key: "orderId", title: "Order ID" },
        { key: "orderDate", title: "Order Date" },
        { key: "orderStatus", title: "Status" },
        { key: "actions", title: "Actions" },
    ];

    const actions = [
        {
            label: "ViewOrderDetails",
            icon: Eye,
            handler: (item) => {
                navigate(`/orders/order-list/order-details/${item.orderId}`);
            }
        },
    ];

    const renderCell = (item, column, index) => {
        if (column.key === "index") {
            return (currentPage - 1) * itemsPerPage + index + 1;
        }

        if (column.key === "orderDate") {
            if (item.orderDate?.seconds) {
                const date = new Date(
                    item.orderDate.seconds * 1000 + item.orderDate.nanoseconds / 1000000
                );
                return date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            } else {
                return "-";
            }
        }

        if (column.key === "orderStatus") {
            const statusCode = item.orderStatus;
            const statusLabel = getStatusLabel(statusCode);
            const statusColor = getStatusColor(statusCode);
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusLabel}
                </span>
            );
        }

        if (column.key === "actions" && actions) {
            return (
                <div className="flex space-x-2">
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => action.handler && action.handler(item)}
                            className={`flex items-center justify-center rounded transition-colors ${
                                action.label === "ViewOrderDetails" ? "text-green-600 hover:text-green-800" : ""
                            } ${
                                action.label === "Delete" ? "text-red-600 hover:text-red-800" : ""
                            }`}
                        >
                            {action.icon && (
                                <span className="mr-1">
                                    <action.icon width={20} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            );
        }

        return item[column.key] || "-";
    };

    if (initialLoading) {
        return (
            <div>
                <BreadCrumb items={[{ label: "Order List", path: "#" }]} />
                <PageHeader
                    title="Order List"
                    className="border-b border-gray-200 pb-4"
                />
                <Preloader />
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb items={[{ label: "Order List", path: "#" }]} />
            <PageHeader
                title="Order List"
                className="border-b border-gray-200 pb-4"
            />
            <div className="p-2">
                <ServerPaginatedDataTable
                    columns={columns}
                    data={orders}
                    actions={actions}
                    renderCell={renderCell}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalOrders}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    loading={tableLoading}
                />
            </div>
        </div>
    );
};

export default OrderList;