import React, { useState } from 'react'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Search,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    {
      title: "Orders",
      value: "2,350",
      change: "+10.5% from last month",
      trend: "up",
      icon: ShoppingCart
    },
    {
      title: "Products",
      value: "1,234",
      change: "-2.3% from last month",
      trend: "down",
      icon: Package
    },
    {
      title: "Active Users",
      value: "8,439",
      change: "+15.2% from last month",
      trend: "up",
      icon: Users
    }
  ]

  const recentOrders = [
    { id: "#3001", customer: "John Smith", amount: "$125.99", status: "Completed", date: "2024-01-15" },
    { id: "#3002", customer: "Sarah Johnson", amount: "$89.50", status: "Processing", date: "2024-01-15" },
    { id: "#3003", customer: "Mike Davis", amount: "$249.99", status: "Shipped", date: "2024-01-14" },
    { id: "#3004", customer: "Emma Wilson", amount: "$67.25", status: "Pending", date: "2024-01-14" },
    { id: "#3005", customer: "Alex Brown", amount: "$189.00", status: "Completed", date: "2024-01-13" }
  ]

  const topProducts = [
    { name: "Wireless Headphones", sales: 1234, revenue: "$24,680", trend: "up" },
    { name: "Smart Watch", sales: 987, revenue: "$19,740", trend: "up" },
    { name: "Laptop Stand", sales: 756, revenue: "$15,120", trend: "down" },
    { name: "USB-C Cable", sales: 654, revenue: "$9,810", trend: "up" },
    { name: "Bluetooth Speaker", sales: 543, revenue: "$16,290", trend: "up" }
  ]

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
     

      {/* Main Content */}
      <div className=" lg:ml-0">
       
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
                  <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <stat.icon className={`w-6 h-6 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  View all orders
                </button>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} sales</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900 mr-2">{product.revenue}</span>
                        {product.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  View all products
                </button>
              </div>
            </div>
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