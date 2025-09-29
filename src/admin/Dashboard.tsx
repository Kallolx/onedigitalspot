import React, { useState, useEffect } from 'react';
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
import { databases, account } from '@/lib/appwrite';
import { getAllOrders } from '@/lib/orders';
import { RotateLoader } from 'react-spinners';


const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS_ID;

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data states
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Fetch all data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      // Fetch users
      let usersData = [];
      try {
        const usersResponse = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
        usersData = usersResponse.documents;
        setUsers(usersData);
      } catch (err) {
        // If users collection fails, get current user
        try {
          const currentUser = await account.get();
          usersData = [currentUser];
          setUsers(usersData);
        } catch (userErr) {
          console.warn('Could not fetch users:', userErr);
        }
      }

      // Calculate statistics
      calculateStats(ordersData);
      
      // Generate charts data
      generateChartsData(ordersData);
      
      // Set recent orders
      setRecentOrders(ordersData.slice(0, 5));

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData: any[]) => {
    const totalRevenue = ordersData
      .filter(order => order.status?.toLowerCase() === 'completed')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const totalOrders = ordersData.length;
    const totalUsers = users.length;
    
    // Count unique products
    const uniqueProducts = new Set(ordersData.map(order => order.productName)).size;
    
    setStats({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts: uniqueProducts
    });
  };

  const generateChartsData = (ordersData: any[]) => {
    // Filter orders based on time range
    const now = new Date();
    const daysToSubtract = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    
    const filteredOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt || order.$createdAt);
      return orderDate >= startDate;
    });

    // Generate daily sales data
    const salesByDay = {};
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayKey = timeRange === '24h' ? 
        date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) :
        date.toLocaleDateString('en-US', { weekday: 'short' });
      
      salesByDay[dayKey] = { name: dayKey, revenue: 0, orders: 0, customers: 0 };
    }

    // Populate with real data
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.$createdAt);
      const dayKey = timeRange === '24h' ? 
        orderDate.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) :
        orderDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (salesByDay[dayKey]) {
        salesByDay[dayKey].revenue += order.totalAmount || 0;
        salesByDay[dayKey].orders += 1;
        salesByDay[dayKey].customers += 1; // Simplified - could track unique customers
      }
    });

    setSalesData(Object.values(salesByDay).reverse());

    // Generate category data
    const categoryStats = {};
    const categoryColors = {
      'Mobile Games': '#3B82F6',
      'PC Games': '#8B5CF6', 
      'Gift Cards': '#10B981',
      'AI Tools': '#F59E0B',
      'Subscriptions': '#EF4444',
      'Productivity': '#06B6D4'
    };

    filteredOrders.forEach(order => {
      const category = order.productType || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          value: 0,
          count: 0,
          color: categoryColors[category] || '#6B7280'
        };
      }
      categoryStats[category].value += order.totalAmount || 0;
      categoryStats[category].count += 1;
    });

    // Calculate percentages
    const totalValue = Object.values(categoryStats).reduce((sum: number, cat: any) => sum + (Number(cat.value) || 0), 0) as number;
    const categoryDataWithPercentage = Object.values(categoryStats).map((cat: any) => {
      const catValue = Number(cat.value) || 0;
      return {
        ...cat,
        percentage: totalValue > 0 ? Math.round((catValue / totalValue) * 100) : 0
      };
    });

    setCategoryData(categoryDataWithPercentage);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour(s) ago`;
    return `${Math.floor(diffInMinutes / 1440)} day(s) ago`;
  };

  const StatCard = ({ title, value, description }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
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
            value={`$${stats.totalRevenue.toLocaleString()}`}
            description="Total earnings this period"
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders.toLocaleString()}
            description="Total orders placed"
          />
          <StatCard
            title="Customers"
            value={stats.totalUsers.toLocaleString()}
            description="Registered users"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toLocaleString()}
            description="Active products"
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
      </div>
    </div>
  );
};

export default Dashboard;