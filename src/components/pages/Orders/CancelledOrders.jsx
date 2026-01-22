import React, { useEffect, useState } from 'react'
import BreadCrumb from '../../layout/BreadCrumb'
import { PageHeader } from '../../common/PageHeader'
import { Eye } from 'lucide-react'
import { collection, query, where, orderBy, limit, startAfter, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '../../../firebase'
import Preloader from '../../common/Preloader'
import ServerPaginatedDataTable from '../../layout/ServerPaginatedDataTable'
import { useNavigate } from 'react-router-dom'

const CancelledOrders = () => {
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
            const q = query(orderRef, where("orderStatus", "==", 7));
            const snapshot = await getCountFromServer(q);
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
                    where("orderStatus", "==", 7),
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
                        where("orderStatus", "==", 7),
                        orderBy("orderDate", "desc"),
                        startAfter(prevPageCache.lastVisible),
                        limit(perPage)
                    );
                } else {
                    // If cache missing, fetch from beginning (fallback)
                    const skip = (page - 1) * perPage;
                    q = query(
                        orderRef,
                        where("orderStatus", "==", 7),
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
            console.error("Error fetching cancelled orders:", error);
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
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    User Canceled
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
                            className="flex items-center justify-center rounded transition-colors text-green-600 hover:text-green-800"
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
                <BreadCrumb items={[
                  { label: "Manage Orders", path: "#" },
                { label: "Cancelled Orders", path: "#" }
                ]} />
                <PageHeader
                    title="Cancelled Orders"
                    className="border-b border-gray-200 pb-4"
                />
                <Preloader />
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb items={[
                  { label: "Manage Orders", path: "#" },
                { label: "Cancelled Orders", path: "#" }
                ]} />
            <PageHeader
                title="Cancelled Orders"
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

export default CancelledOrders;