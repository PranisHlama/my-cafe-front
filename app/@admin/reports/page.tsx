import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Filter
} from "lucide-react";

export default function ReportsPage() {
  const reportData = {
    sales: {
      today: 1234,
      yesterday: 1180,
      change: "+4.6%",
      trend: "up"
    },
    orders: {
      today: 24,
      yesterday: 22,
      change: "+9.1%",
      trend: "up"
    },
    customers: {
      today: 156,
      yesterday: 142,
      change: "+9.9%",
      trend: "up"
    },
    avgOrder: {
      today: 51.42,
      yesterday: 53.64,
      change: "-4.1%",
      trend: "down"
    }
  };

  const topItems = [
    { name: "Cappuccino", sales: 45, revenue: 225.00 },
    { name: "Latte", sales: 38, revenue: 190.00 },
    { name: "Croissant", sales: 32, revenue: 96.00 },
    { name: "Espresso", sales: 28, revenue: 84.00 },
    { name: "Blueberry Muffin", sales: 25, revenue: 75.00 }
  ];

  const timeData = [
    { hour: "8:00", orders: 5, sales: 125.50 },
    { hour: "9:00", orders: 12, sales: 298.75 },
    { hour: "10:00", orders: 18, sales: 456.20 },
    { hour: "11:00", orders: 15, sales: 378.90 },
    { hour: "12:00", orders: 22, sales: 589.45 },
    { hour: "13:00", orders: 19, sales: 445.60 },
    { hour: "14:00", orders: 16, sales: 398.30 },
    { hour: "15:00", orders: 14, sales: 325.80 },
    { hour: "16:00", orders: 11, sales: 267.40 },
    { hour: "17:00", orders: 8, sales: 198.75 }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your cafe performance</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Date Range:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${reportData.sales.today}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              reportData.sales.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {reportData.sales.trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${
              reportData.sales.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {reportData.sales.change} from yesterday
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.orders.today}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              reportData.orders.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {reportData.orders.trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${
              reportData.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {reportData.orders.change} from yesterday
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.customers.today}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              reportData.customers.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {reportData.customers.trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${
              reportData.customers.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {reportData.customers.change} from yesterday
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${reportData.avgOrder.today}</p>
            </div>
            <div className={`p-2 rounded-lg ${
              reportData.avgOrder.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {reportData.avgOrder.trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-sm ${
              reportData.avgOrder.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {reportData.avgOrder.change} from yesterday
            </span>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{item.sales} sold</p>
                  <p className="text-xs text-gray-600">${item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hourly Performance</h2>
          <div className="space-y-3">
            {timeData.map((data) => (
              <div key={data.hour} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-900">{data.hour}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{data.orders} orders</span>
                  <span className="text-sm font-medium text-gray-900">${data.sales.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Reports */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Beverages</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Food</span>
              <span className="text-sm font-medium text-gray-900">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Desserts</span>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Card</span>
              <span className="text-sm font-medium text-gray-900">65%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cash</span>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Mobile</span>
              <span className="text-sm font-medium text-gray-900">10%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
            <div className="text-sm text-gray-600 mb-2">Average Rating</div>
            <div className="text-xs text-gray-500">Based on 156 reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
} 