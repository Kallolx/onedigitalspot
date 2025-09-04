import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Eye, 
  Settings, 
  Plus, 
  Bell, 
  Search, 
  Filter, 
  Calendar, 
  Download,
  MoreHorizontal,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import NotificationDropdown from '../components/custom/NotificationDropdown';


const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Enhanced sample data
  const salesData = [
    { name: 'Mon', revenue: 2400, orders: 24, customers: 18 },
    { name: 'Tue', revenue: 1398, orders: 18, customers: 15 },
    { name: 'Wed', revenue: 9800, orders: 45, customers: 32 },
    { name: 'Thu', revenue: 3908, orders: 38, customers: 28 },
    { name: 'Fri', revenue: 4800, orders: 42, customers: 35 },
    { name: 'Sat', revenue: 3800, orders: 35, customers: 29 },
    { name: 'Sun', revenue: 4300, orders: 40, customers: 31 },
  ];

  const categoryData = [
    { name: 'Mobile Games', value: 1200, color: '#3B82F6', percentage: 35 },
    { name: 'PC Games', value: 950, color: '#8B5CF6', percentage: 28 },
    { name: 'Top Up', value: 700, color: '#10B981', percentage: 20 },
    { name: 'Gift Cards', value: 500, color: '#F59E0B', percentage: 12 },
    { name: 'AI Tools', value: 150, color: '#EF4444', percentage: 5 },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Alex Johnson', product: 'Premium Gaming Pack', amount: 249.99, status: 'completed', time: '2 min ago', avatar: 'AJ' },
    { id: '#ORD-002', customer: 'Sarah Davis', product: 'Mobile Top-up Bundle', amount: 189.50, status: 'processing', time: '5 min ago', avatar: 'SD' },
    { id: '#ORD-003', customer: 'Mike Wilson', product: 'Steam Gift Card', amount: 99.99, status: 'completed', time: '12 min ago', avatar: 'MW' },
    { id: '#ORD-004', customer: 'Emma Brown', product: 'AI Tool Subscription', amount: 299.99, status: 'pending', time: '18 min ago', avatar: 'EB' },
    { id: '#ORD-005', customer: 'David Lee', product: 'Game Credit Pack', amount: 149.99, status: 'completed', time: '25 min ago', avatar: 'DL' },
  ];

  const quickActions = [
    { title: 'Add Product', icon: Plus, color: 'bg-blue-500', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
    { title: 'Create Order', icon: ShoppingCart, color: 'bg-green-500', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
    { title: 'Manage Users', icon: Users, color: 'bg-purple-500', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' },
    { title: 'View Analytics', icon: Activity, color: 'bg-orange-500', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100' },
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, gradient, description }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              changeType === 'positive' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change}%
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions = null, className = "" }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        icon: CheckCircle,
        text: 'Completed',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      },
      processing: {
        icon: Clock,
        text: 'Processing',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      pending: {
        icon: AlertCircle,
        text: 'Pending',
        className: 'bg-amber-100 text-amber-800 border-amber-200'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-xl focus:ring-2 bg-background text-gray-900 placeholder-gray-500 transition-all duration-200"
              />
            </div>
            
            <NotificationDropdown />
            
            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-8">
        {/* Time Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    timeRange === range 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$45,210"
            change="12.5"
            changeType="positive"
            icon={DollarSign}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            description="vs last month"
          />
          <StatCard
            title="Products Sold"
            value="3,240"
            change="8.2"
            changeType="positive"
            icon={Package}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            description="items this month"
          />
          <StatCard
            title="Active Users"
            value="1,180"
            change="15.3"
            changeType="positive"
            icon={Users}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            description="online now"
          />
          <StatCard
            title="Total Orders"
            value="2,450"
            change="4.1"
            changeType="positive"
            icon={ShoppingCart}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
            description="processed today"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <ChartCard 
            title="Revenue Overview" 
            className="xl:col-span-2"
            actions={
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Revenue</option>
                <option>Orders</option>
                <option>Customers</option>
              </select>
            }
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category Distribution */}
          <ChartCard title="Sales by Category">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                    <span className="text-xs text-gray-500">${category.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <ChartCard 
            title="Recent Orders" 
            className="xl:col-span-2"
            actions={
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200">
                View All Orders
              </button>
            }
          >
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {order.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{order.customer}</span>
                        <span className="text-xs text-gray-500">{order.id}</span>
                      </div>
                      <p className="text-sm text-gray-600">{order.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.amount}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Quick Actions */}
          <ChartCard title="Quick Actions">
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={index}
                    className={`w-full flex items-center gap-4 p-4 ${action.bgColor} ${action.hoverColor} rounded-xl transition-all duration-200 group hover:scale-[1.02]`}
                  >
                    <div className={`p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      {action.title}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Performance</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Your store is performing 23% better than last month!</p>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                View Details →
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;