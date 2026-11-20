import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ShoppingCart,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
} from "lucide-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { db } from "../../firebase";

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [monthlyOrderData, setMonthlyOrderData] = useState([]);
  const [dailyOrderData, setDailyOrderData] = useState([]);
  const [chartView, setChartView] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDailyYear, setSelectedDailyYear] = useState(
    new Date().getFullYear()
  );
  const [selectedDailyMonth, setSelectedDailyMonth] = useState(
    new Date().getMonth()
  );
  const [availableYears, setAvailableYears] = useState([]);
  const [availableDailyYears, setAvailableDailyYears] = useState([]);
  const [allMonthlyData, setAllMonthlyData] = useState([]);
  const [allDailyDataByMonth, setAllDailyDataByMonth] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);

        const productsSnapshot = await getDocs(collection(db, "products"));
        setProductCount(productsSnapshot.size);

        const activeUsersQuery = query(
          collection(db, "users"),
          where("isActive", "==", true)
        );
        const usersSnapshot = await getDocs(activeUsersQuery);
        setUserCount(usersSnapshot.size);

        const ordersSnapshot = await getDocs(collection(db, "orders"));
        setOrderCount(ordersSnapshot.size);

        let pending = 0;
        let delivered = 0;
        let cancelled = 0;

        const monthCounts = {};
        const dayCounts = {};
        const yearsSet = new Set();
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data();

          if (orderData.orderStatus === 0) pending += 1;
          else if (orderData.orderStatus === 4) delivered += 1;
          else if (orderData.orderStatus === 7) cancelled += 1;

          if (orderData.orderDate) {
            let date;
            if (orderData.orderDate.toDate) {
              date = orderData.orderDate.toDate();
            } else {
              date = new Date(orderData.orderDate);
            }

            const year = date.getFullYear();
            yearsSet.add(year);

            const monthYear = `${monthNames[date.getMonth()]} ${year}`;
            const monthKey = `${year}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`;

            if (!monthCounts[monthKey]) {
              monthCounts[monthKey] = {
                month: monthNames[date.getMonth()],
                year: year,
                monthYear: monthYear,
                orders: 0,
              };
            }
            monthCounts[monthKey].orders += 1;

            const dayKey = date.toISOString().split("T")[0];
            dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
          }
        });

        setPendingCount(pending);
        setDeliveredCount(delivered);
        setCancelledCount(cancelled);

        const monthlyDataByYear = {};
        const currentYear = new Date().getFullYear();
        for (let year = 2025; year <= currentYear; year++) {
          monthlyDataByYear[year] = monthNames.map((month) => ({
            month: month,
            year: year,
            monthYear: `${month} ${year}`,
            orders: 0,
          }));
        }

        Object.entries(monthCounts).forEach(([key, data]) => {
          const monthIndex = monthNames.indexOf(data.month);
          if (
            monthlyDataByYear[data.year] &&
            monthlyDataByYear[data.year][monthIndex]
          ) {
            monthlyDataByYear[data.year][monthIndex].orders = data.orders;
          }
        });

        const allMonthlyChartData = Object.entries(monthlyDataByYear)
          .flatMap(([year, months]) => months)
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
          });

        setAllMonthlyData(allMonthlyChartData);
        setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));

        const currentYearData = allMonthlyChartData.filter(
          (item) => item.year === currentYear
        );
        setMonthlyOrderData(currentYearData);

        const today = new Date();
        const allDaysArray = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayKey = date.toISOString().split("T")[0];
          const dayLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          allDaysArray.push({
            day: dayLabel,
            orders: dayCounts[dayKey] || 0,
          });
        }

        const dailyDataByMonth = {};
        const dailyYearsSet = new Set();

        Object.entries(dayCounts).forEach(([dayKey, count]) => {
          const date = new Date(dayKey);
          const year = date.getFullYear();
          const month = date.getMonth();
          const mKey = `${year}-${String(month + 1).padStart(2, "0")}`;
          dailyYearsSet.add(year);

          if (!dailyDataByMonth[mKey]) dailyDataByMonth[mKey] = [];

          const dayLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          dailyDataByMonth[mKey].push({
            day: dayLabel,
            orders: count,
            date: date,
          });
        });

        Object.keys(dailyDataByMonth).forEach((monthKey) => {
          const [year, month] = monthKey.split("-");
          const monthNum = parseInt(month) - 1;
          const daysInMonth = new Date(
            parseInt(year),
            monthNum + 1,
            0
          ).getDate();

          const daysInMonthArray = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(parseInt(year), monthNum, day);
            const dayLabel = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const existingDay = dailyDataByMonth[monthKey].find(
              (d) => d.day === dayLabel
            );

            daysInMonthArray.push({
              day: dayLabel,
              orders: existingDay ? existingDay.orders : 0,
              date: date,
            });
          }

          daysInMonthArray.sort((a, b) => a.date - b.date);
          dailyDataByMonth[monthKey] = daysInMonthArray.map(
            ({ day, orders }) => ({ day, orders })
          );
        });

        setAllDailyDataByMonth(dailyDataByMonth);
        setAvailableDailyYears(
          Array.from(dailyYearsSet).sort((a, b) => a - b)
        );
        setDailyOrderData(allDaysArray);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const filteredData = allMonthlyData.filter(
      (item) => item.year === selectedYear
    );
    setMonthlyOrderData(filteredData);
  }, [selectedYear, allMonthlyData]);

  useEffect(() => {
    const monthKey = `${selectedDailyYear}-${String(
      selectedDailyMonth + 1
    ).padStart(2, "0")}`;
    const filteredData = allDailyDataByMonth[monthKey] || [];
    setDailyOrderData(filteredData);
  }, [selectedDailyYear, selectedDailyMonth, allDailyDataByMonth]);

  const stats = [
    {
      title: "Total Orders",
      value: orderCount,
      icon: ShoppingCart,
      gradient: "linear-gradient(135deg, #ac1f67 0%, #d4447a 100%)",
      lightBg: "rgba(172, 31, 103, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Products",
      value: productCount,
      icon: Package,
      gradient: "linear-gradient(135deg, #3c87c8 0%, #5ba3e0 100%)",
      lightBg: "rgba(60, 135, 200, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Active Users",
      value: userCount,
      icon: Users,
      gradient: "linear-gradient(135deg, #f3911f 0%, #f5a84d 100%)",
      lightBg: "rgba(243, 145, 31, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      lightBg: "rgba(139, 92, 246, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "Active",
      trendUp: null,
    },
    {
      title: "Delivered",
      value: deliveredCount,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      lightBg: "rgba(16, 185, 129, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Cancelled",
      value: cancelledCount,
      icon: XCircle,
      gradient: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
      lightBg: "rgba(239, 68, 68, 0.08)",
      iconBg: "rgba(255,255,255,0.2)",
      textColor: "#ffffff",
      trend: "-3%",
      trendUp: false,
    },
  ];

  const chartSetting = {
    yAxis: [
      {
        label: "Orders Count",
      },
    ],
    height: 400,
    sx: {
      "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
        fill: "#6b7280",
        fontSize: "12px",
      },
      "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
        fill: "#6b7280",
        fontSize: "11px",
      },
      "& .MuiChartsAxis-label": {
        fill: "#374151",
        fontWeight: 600,
      },
    },
  };

  const currentData =
    chartView === "monthly" ? monthlyOrderData : dailyOrderData;
  const xAxisKey = chartView === "monthly" ? "month" : "day";

  // Skeleton loader for cards
  const CardSkeleton = () => (
    <div className="rounded-2xl p-5 animate-pulse bg-gray-100">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fc" }}>
      <main className="p-3 md:p-4 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1
                className="text-2xl md:text-3xl font-extrabold"
                style={{ color: "#1a1a2e" }}
              >
                Dashboard Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: "rgba(172, 31, 103, 0.08)",
                color: "#ac1f67",
              }}
            >
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, i) => <CardSkeleton key={i} />)
            : stats.map((stat, index) => {
                const IconComp = stat.icon;
                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl p-5 cursor-pointer overflow-hidden"
                    style={{
                      background: stat.gradient,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-4px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0,0,0,0.08)";
                    }}
                  >
                    {/* Background decoration */}
                    <div
                      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
                      style={{ backgroundColor: "white" }}
                    />
                    <div
                      className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
                      style={{ backgroundColor: "white" }}
                    />

                    <div className="relative flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className="text-sm font-semibold tracking-wide uppercase"
                          style={{ color: "rgba(255,255,255,0.85)" }}
                        >
                          {stat.title}
                        </p>

                        <div className="flex items-baseline gap-2 mt-3">
                          <p
                            className="text-3xl md:text-4xl font-extrabold"
                            style={{ color: "#ffffff" }}
                          >
                            {stat.value.toLocaleString()}
                          </p>
                        </div>

                        {/* Trend indicator */}
                        <div className="flex items-center gap-1 mt-3">
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.2)",
                              color: "#ffffff",
                            }}
                          >
                            {stat.trendUp === true && (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {stat.trendUp === false && (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {stat.trend}
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            vs last month
                          </span>
                        </div>
                      </div>

                      {/* Icon */}
                      <div
                        className="flex items-center justify-center w-14 h-14 rounded-2xl"
                        style={{
                          backgroundColor: stat.iconBg,
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <IconComp className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Bottom progress bar decoration */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                      }}
                    />
                  </div>
                );
              })}
        </div>

        {/* Orders Chart Section */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Chart Header */}
          <div
            className="p-4 md:p-5"
            style={{
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              background:
                "linear-gradient(135deg, rgba(172,31,103,0.03), rgba(60,135,200,0.03))",
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #ac1f67, #3c87c8)",
                  }}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2
                    className="text-lg md:text-xl font-bold"
                    style={{ color: "#1a1a2e" }}
                  >
                    {chartView === "monthly"
                      ? `Monthly Orders — ${selectedYear}`
                      : `Daily Orders`}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {chartView === "monthly"
                      ? "Order trends across months"
                      : "Day-wise order distribution"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Year/Month Selectors */}
                {chartView === "monthly" && availableYears.length > 0 && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                    style={{
                      border: "2px solid rgba(172,31,103,0.2)",
                      color: "#ac1f67",
                      backgroundColor: "rgba(172,31,103,0.04)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "#ac1f67")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(172,31,103,0.2)")
                    }
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                )}

                {chartView === "daily" && availableDailyYears.length > 0 && (
                  <>
                    <select
                      value={selectedDailyYear}
                      onChange={(e) =>
                        setSelectedDailyYear(Number(e.target.value))
                      }
                      className="px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                      style={{
                        border: "2px solid rgba(60,135,200,0.2)",
                        color: "#3c87c8",
                        backgroundColor: "rgba(60,135,200,0.04)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "#3c87c8")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(60,135,200,0.2)")
                      }
                    >
                      {availableDailyYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedDailyMonth}
                      onChange={(e) =>
                        setSelectedDailyMonth(Number(e.target.value))
                      }
                      className="px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                      style={{
                        border: "2px solid rgba(60,135,200,0.2)",
                        color: "#3c87c8",
                        backgroundColor: "rgba(60,135,200,0.04)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "#3c87c8")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(60,135,200,0.2)")
                      }
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {/* Toggle Buttons */}
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{
                    border: "2px solid rgba(172,31,103,0.15)",
                    backgroundColor: "rgba(172,31,103,0.04)",
                  }}
                >
                  <button
                    onClick={() => setChartView("monthly")}
                    className="px-5 py-2.5 text-sm font-semibold transition-all duration-300"
                    style={
                      chartView === "monthly"
                        ? {
                            background:
                              "linear-gradient(135deg, #ac1f67, #d4447a)",
                            color: "#ffffff",
                          }
                        : {
                            background: "transparent",
                            color: "#ac1f67",
                          }
                    }
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartView("daily")}
                    className="px-5 py-2.5 text-sm font-semibold transition-all duration-300"
                    style={
                      chartView === "daily"
                        ? {
                            background:
                              "linear-gradient(135deg, #ac1f67, #d4447a)",
                            color: "#ffffff",
                          }
                        : {
                            background: "transparent",
                            color: "#ac1f67",
                          }
                    }
                  >
                    Daily
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Body */}
          <div className="p-4 md:p-5">
            {currentData.length > 0 ? (
              <div
                className="w-full overflow-x-auto"
                style={{
                  minWidth:
                    chartView === "monthly" ? "auto" : "auto",
                }}
              >
                <div
                  style={{
                    minWidth:
                      chartView === "monthly" ? "800px" : "1000px",
                  }}
                >
                  <BarChart
                    dataset={currentData}
                    xAxis={[
                      {
                        dataKey: xAxisKey,
                        scaleType: "band",
                        tickPlacement: "middle",
                        tickLabelPlacement: "middle",
                      },
                    ]}
                    series={[
                      {
                        dataKey: "orders",
                        label: "Orders",
                        color: "#ac1f67",
                      },
                    ]}
                    borderRadius={8}
                    {...chartSetting}
                  />
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20"
                style={{ color: "#9ca3af" }}
              >
                <BarChart3
                  className="w-16 h-16 mb-4"
                  style={{ color: "rgba(172,31,103,0.2)" }}
                />
                <p className="text-lg font-semibold text-gray-400">
                  {chartView === "monthly"
                    ? `No order data available for ${selectedYear}`
                    : "No data for selected period"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try selecting a different time period
                </p>
              </div>
            )}
          </div>
        </div>

       
      </main>
    </div>
  );
};

export default Dashboard;