import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react'
import { BarChart } from '@mui/x-charts/BarChart';
import { db } from '../../firebase';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [monthlyOrderData, setMonthlyOrderData] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get Products Count
        const productsSnapshot = await getDocs(collection(db, "products"));
        setProductCount(productsSnapshot.size);

        // Get Active Users Count
        const activeUsersQuery = query(
          collection(db, "users"),
          where("isActive", "==", true)
        );
        const usersSnapshot = await getDocs(activeUsersQuery);
        setUserCount(usersSnapshot.size);

        // Get Orders Count and Monthly Data
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        setOrderCount(ordersSnapshot.size);

        // Process monthly order data
        const monthCounts = {};
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();
          if (orderData.orderDate) {
            // Handle both Firestore Timestamp and regular date
            let date;
            if (orderData.orderDate.toDate) {
              date = orderData.orderDate.toDate();
            } else {
              date = new Date(orderData.orderDate);
            }
            
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
          }
        });

        // Convert to array format for chart
        const chartData = Object.entries(monthCounts)
          .map(([month, count]) => ({
            month,
            orders: count
          }))
          .sort((a, b) => {
            // Sort by date
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA - dateB;
          });

        setMonthlyOrderData(chartData);

      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    {
      title: "Orders",
      value: orderCount.toString(),
      icon: ShoppingCart
    },
    {
      title: "Products",
      value: productCount.toString(),
      icon: Package
    },
    {
      title: "Active Users",
      value: userCount.toString(),
      icon: Users
    }
  ];

  const chartSetting = {
    yAxis: [
      {
        label: 'Orders Count',
      },
    ],
    height: 400,
    sx: {
      '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': {
        fill: '#666',
      },
      '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
        fill: '#666',
      },
      '& .MuiChartsAxis-label': {
        fill: '#333',
      },
    },
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      {/* Main Content */}
      <div className="lg:ml-0">
        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <stat.icon className="w-6 h-6 text-[#81184e]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Orders</h2>
            {monthlyOrderData.length > 0 ? (
              <BarChart
                dataset={monthlyOrderData}
                xAxis={[{ 
                  dataKey: 'month', 
                  scaleType: 'band',
                  tickPlacement: 'middle',
                  tickLabelPlacement: 'middle'
                }]}
                series={[
                  { 
                    dataKey: 'orders', 
                    label: 'Orders',
                    color: '#81184e'
                  }
                ]}
                {...chartSetting}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                Loading chart data...
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Dashboard