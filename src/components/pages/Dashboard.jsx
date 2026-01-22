import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { BarChart } from '@mui/x-charts/BarChart';
import { db } from '../../firebase';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [monthlyOrderData, setMonthlyOrderData] = useState([]);
  const [dailyOrderData, setDailyOrderData] = useState([]);
  const [chartView, setChartView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDailyYear, setSelectedDailyYear] = useState(new Date().getFullYear());
  const [selectedDailyMonth, setSelectedDailyMonth] = useState(new Date().getMonth());
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDailyYears, setAvailableDailyYears] = useState([]);
  const [allMonthlyData, setAllMonthlyData] = useState([]);
  const [allDailyDataByMonth, setAllDailyDataByMonth] = useState({});

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

        // Get Orders Count and Monthly/Daily Data
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        setOrderCount(ordersSnapshot.size);

        // Initialize status counters
        let pending = 0;
        let delivered = 0;
        let cancelled = 0;

        // Process monthly order data and count order statuses
        const monthCounts = {};
        const dayCounts = {};
        const yearsSet = new Set();
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();

          // Count order statuses
          if (orderData.orderStatus === 0) {
            pending += 1;
          } else if (orderData.orderStatus === 4) {
            delivered += 1;
          } else if (orderData.orderStatus === 7) {
            cancelled += 1;
          }

          if (orderData.orderDate) {
            // Handle both Firestore Timestamp and regular date
            let date;
            if (orderData.orderDate.toDate) {
              date = orderData.orderDate.toDate();
            } else {
              date = new Date(orderData.orderDate);
            }

            const year = date.getFullYear();
            yearsSet.add(year);

            // Monthly grouping
            const monthYear = `${monthNames[date.getMonth()]} ${year}`;
            const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthCounts[monthKey]) {
              monthCounts[monthKey] = {
                month: monthNames[date.getMonth()],
                year: year,
                monthYear: monthYear,
                orders: 0
              };
            }
            monthCounts[monthKey].orders += 1;

            // Daily grouping (last 30 days)
            const dayKey = date.toISOString().split('T')[0];
            dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
          }
        });

        // Set order status counts
        setPendingCount(pending);
        setDeliveredCount(delivered);
        setCancelledCount(cancelled);


        // Convert monthly data to array format for chart - include all 12 months
        const monthlyDataByYear = {};

        // Initialize all months for each year
        const currentYear = new Date().getFullYear();
        for (let year = 2025; year <= currentYear; year++) {
          monthlyDataByYear[year] = monthNames.map((month, index) => ({
            month: month,
            year: year,
            monthYear: `${month} ${year}`,
            orders: 0
          }));
        }

        // Fill in actual data
        Object.entries(monthCounts).forEach(([key, data]) => {
          const monthIndex = monthNames.indexOf(data.month);
          if (monthlyDataByYear[data.year] && monthlyDataByYear[data.year][monthIndex]) {
            monthlyDataByYear[data.year][monthIndex].orders = data.orders;
          }
        });

        // Flatten and sort
        const allMonthlyChartData = Object.entries(monthlyDataByYear)
          .flatMap(([year, months]) => months)
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
          });

        setAllMonthlyData(allMonthlyChartData);

        // Filter for current year initially
        const currentYearData = allMonthlyChartData.filter(item => item.year === currentYear);
        setMonthlyOrderData(currentYearData);

        // Convert daily data to array format and get last 30 days including missing dates
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Create array for all 30 days
        const allDaysArray = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayKey = date.toISOString().split('T')[0];
          const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          allDaysArray.push({
            day: dayLabel,
            orders: dayCounts[dayKey] || 0
          });
        }

        const dailyChartData = allDaysArray;

        // Organize all daily data by month and year
        const dailyDataByMonth = {};
        const dailyYearsSet = new Set();

        Object.entries(dayCounts).forEach(([dayKey, count]) => {
          const date = new Date(dayKey);
          const year = date.getFullYear();
          const month = date.getMonth();
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

          dailyYearsSet.add(year);

          if (!dailyDataByMonth[monthKey]) {
            dailyDataByMonth[monthKey] = [];
          }

          const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyDataByMonth[monthKey].push({
            day: dayLabel,
            orders: count,
            date: date
          });
        });

        // Fill in missing days for each month
        Object.keys(dailyDataByMonth).forEach((monthKey) => {
          const [year, month] = monthKey.split('-');
          const monthNum = parseInt(month) - 1;
          const daysInMonth = new Date(parseInt(year), monthNum + 1, 0).getDate();

          const daysInMonthArray = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(parseInt(year), monthNum, day);
            const dayKey = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const existingDay = dailyDataByMonth[monthKey].find(d => d.day === dayLabel);

            daysInMonthArray.push({
              day: dayLabel,
              orders: existingDay ? existingDay.orders : 0,
              date: date
            });
          }

          daysInMonthArray.sort((a, b) => a.date - b.date);
          dailyDataByMonth[monthKey] = daysInMonthArray.map(({ day, orders }) => ({ day, orders }));
        });

        setAllDailyDataByMonth(dailyDataByMonth);
        setAvailableDailyYears(Array.from(dailyYearsSet).sort((a, b) => a - b));
        setDailyOrderData(dailyChartData);

      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  // Filter monthly data when year changes
  useEffect(() => {
    const filteredData = allMonthlyData.filter(item => item.year === selectedYear);
    setMonthlyOrderData(filteredData);
  }, [selectedYear, allMonthlyData]);

  // Filter daily data when month or year changes
  useEffect(() => {
    const monthKey = `${selectedDailyYear}-${String(selectedDailyMonth + 1).padStart(2, '0')}`;
    const filteredData = allDailyDataByMonth[monthKey] || [];
    setDailyOrderData(filteredData);
  }, [selectedDailyYear, selectedDailyMonth, allDailyDataByMonth]);

  const stats = [
    {
      title: "Orders",
      value: orderCount.toString(),
      icon: ShoppingCart,
      bg: "bg-gradient-to-br from-blue-100 to-blue-200"
    },
    {
      title: "Products",
      value: productCount.toString(),
      icon: Package,
      bg: "bg-gradient-to-br from-purple-100 to-purple-200"
    },
    {
      title: "Active Users",
      value: userCount.toString(),
      icon: Users,
      bg: "bg-gradient-to-br from-green-100 to-green-200"
    },
    {
      title: "Pending Orders",
      value: pendingCount.toString(),
      icon: Clock,
      bg: "bg-gradient-to-br from-amber-100 to-amber-200"
    },
    {
      title: "Delivered Orders",
      value: deliveredCount.toString(),
      icon: CheckCircle,
      bg: "bg-gradient-to-br from-teal-100 to-teal-200"
    },
    {
      title: "Cancelled Orders",
      value: cancelledCount.toString(),
      icon: XCircle,
      bg: "bg-gradient-to-br from-rose-100 to-rose-200"
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

  const currentData = chartView === 'monthly' ? monthlyOrderData : dailyOrderData;
  const xAxisKey = chartView === 'monthly' ? 'month' : 'day';

  return (
    <div className="">
      {/* Main Content */}
      <div className="lg:ml-0">
        {/* Dashboard Content */}
        <main className="p-1">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.bg} rounded-lg shadow p-3 hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-700">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/50">
                    <stat.icon className="w-6 h-6 text-[#81184e]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-2 overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {chartView === 'monthly' ? `Monthly Orders - ${selectedYear}` : 'Daily Orders (Last 30 Days)'}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {/* Year Selector - Only show in monthly view */}
                {chartView === 'monthly' && availableYears.length > 0 && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#81184e] focus:border-transparent"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                )}

                {/* Month and Year Selector - Only show in daily view */}
                {chartView === 'daily' && availableDailyYears.length > 0 && (
                  <>
                    <select
                      value={selectedDailyYear}
                      onChange={(e) => setSelectedDailyYear(Number(e.target.value))}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#81184e] focus:border-transparent"
                    >
                      {availableDailyYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedDailyMonth}
                      onChange={(e) => setSelectedDailyMonth(Number(e.target.value))}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#81184e] focus:border-transparent"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {/* Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartView('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${chartView === 'monthly'
                        ? 'bg-[#81184e] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartView('daily')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${chartView === 'daily'
                        ? 'bg-[#81184e] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    Daily
                  </button>
                </div>
              </div>
            </div>

            {currentData.length > 0 ? (
              <div className="w-full" style={{ minWidth: chartView === 'monthly' ? '1000px' : '1200px' }}>
                <BarChart
                  dataset={currentData}
                  xAxis={[{
                    dataKey: xAxisKey,
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
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                {chartView === 'monthly'
                  ? `No order data available for ${selectedYear}`
                  : 'Loading chart data...'}
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