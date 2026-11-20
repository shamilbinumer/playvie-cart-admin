import React, { useEffect, useState } from 'react'
import BreadCrumb from '../../../layout/BreadCrumb'
import { PageHeader } from '../../../common/PageHeader'
import { Eye } from 'lucide-react'
import { collection, query, orderBy, limit, startAfter, getDocs, getCountFromServer } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../../../firebase'
import Preloader from '../../../common/Preloader'
import ServerPaginatedDataTable from '../../../layout/ServerPaginatedDataTable'

const ReturnOrdersList = () => {
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
            const returnOrderRef = collection(db, "returnOrders");
            const q = query(returnOrderRef);
            const snapshot = await getCountFromServer(q);
            setTotalOrders(snapshot.data().count);
        } catch (error) {
            console.error("Error fetching total count:", error);
        }
    };

    const fetchOrders = async (page, perPage) => {
        const cacheKey = `${page}-${perPage}`;
        
        if (pageCache[cacheKey]) {
            setOrders(pageCache[cacheKey].orders);
            setInitialLoading(false);
            return;
        }

        setTableLoading(true);
        try {
            const returnOrderRef = collection(db, "returnOrders");
            let q;

            if (page === 1) {
                q = query(
                    returnOrderRef,
                    orderBy("createdAt", "desc"),
                    limit(perPage)
                );
            } else {
                const prevCacheKey = `${page - 1}-${perPage}`;
                const prevPageCache = pageCache[prevCacheKey];
                
                if (prevPageCache && prevPageCache.lastVisible) {
                    q = query(
                        returnOrderRef,
                        orderBy("createdAt", "desc"),
                        startAfter(prevPageCache.lastVisible),
                        limit(perPage)
                    );
                } else {
                    const skip = (page - 1) * perPage;
                    q = query(
                        returnOrderRef,
                        orderBy("createdAt", "desc"),
                        limit(skip + perPage)
                    );
                    
                    const allDocs = await getDocs(q);
                    const slicedDocs = allDocs.docs.slice(-perPage);
                    
                    const orderData = slicedDocs.map((doc) => ({
                        ...doc.data(),
                        returnOrderId: doc.id,
                        id: doc.id,
                    }));

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
                returnOrderId: doc.id,
                id: doc.id,
            }));

            const firstDoc = docs[0];
            const lastDoc = docs[docs.length - 1];

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
            console.error("Error fetching return orders:", error);
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
        setCurrentPage(1);
        setPageCache({});
    };

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const columns = [
        { key: "index", title: "#" },
        { key: "orderId", title: "Order ID" },
        { key: "productName", title: "Product Name" },
        { key: "returnAmount", title: "Return Amount" },
        { key: "reason", title: "Reason" },
        { key: "createdAt", title: "Return Date" },
        { key: "returnOrderStatus", title: "Status" },
        { key: "actions", title: "Actions" },
    ];

    const actions = [
        {
            label: "ViewReturnDetails",
            icon: Eye,
            handler: (item) => {
                navigate(`/orders/return-order-details/${item.returnOrderId}`, { state: { orderData: item } });
            }
        },
    ];

    // Updated status mapping to match your order statuses
    const getStatusLabel = (status) => {
        const statusMap = {
            0: { label: "Pending", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
            1: { label: "Accepted", bgColor: "bg-blue-100", textColor: "text-blue-800" },
            2: { label: "Dispatched", bgColor: "bg-indigo-100", textColor: "text-indigo-800" },
            3: { label: "Shipped", bgColor: "bg-purple-100", textColor: "text-purple-800" },
            4: { label: "Delivered", bgColor: "bg-green-100", textColor: "text-green-800" },
            5: { label: "Rejected", bgColor: "bg-red-100", textColor: "text-red-800" },
            6: { label: "Return", bgColor: "bg-orange-100", textColor: "text-orange-800" },
            7: { label: "User Canceled", bgColor: "bg-gray-100", textColor: "text-gray-800" },
            8: { label: "Return Accepted", bgColor: "bg-emerald-100", textColor: "text-emerald-800" },
            9: { label: "Return Rejected", bgColor: "bg-rose-100", textColor: "text-rose-800" },
            10: { label: "Return Received", bgColor: "bg-cyan-100", textColor: "text-cyan-800" },
            11: { label: "Refund Completed", bgColor: "bg-teal-100", textColor: "text-teal-800" },
        };
        return statusMap[status] || { label: "Unknown", bgColor: "bg-gray-100", textColor: "text-gray-800" };
    };

    const renderCell = (item, column, index) => {
        if (column.key === "index") {
            return (currentPage - 1) * itemsPerPage + index + 1;
        }

        if (column.key === "productName") {
            return item.productDetails?.productName || "-";
        }

        if (column.key === "returnAmount") {
            return item.returnAmount ? `₹${item.returnAmount}` : "-";
        }

        if (column.key === "createdAt") {
            if (item.createdAt?.seconds) {
                const date = new Date(
                    item.createdAt.seconds * 1000 + item.createdAt.nanoseconds / 1000000
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

        if (column.key === "returnOrderStatus") {
            const status = getStatusLabel(item.returnOrderStatus);
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                    {status.label}
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
                    { label: "Return Orders", path: "#" }
                ]} />
                <PageHeader
                    title="Return Orders"
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
                { label: "Return Orders", path: "#" }
            ]} />
            <PageHeader
                title="Return Orders"
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

export default ReturnOrdersList;