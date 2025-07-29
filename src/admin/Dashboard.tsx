import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign, Eye, Settings, Plus, Bell, Search, Filter, Calendar, Download } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Sample data for charts
  const salesData = [
    { name: 'Mon', mobileGames: 1200, pcGames: 800, topUp: 400, giftCards: 300, aiTools: 100 },
    { name: 'Tue', mobileGames: 1100, pcGames: 900, topUp: 350, giftCards: 320, aiTools: 120 },
    { name: 'Wed', mobileGames: 1500, pcGames: 950, topUp: 500, giftCards: 400, aiTools: 130 },
    { name: 'Thu', mobileGames: 1700, pcGames: 1000, topUp: 600, giftCards: 450, aiTools: 140 },
    { name: 'Fri', mobileGames: 1600, pcGames: 1100, topUp: 700, giftCards: 500, aiTools: 150 },
    { name: 'Sat', mobileGames: 1800, pcGames: 1200, topUp: 800, giftCards: 600, aiTools: 160 },
    { name: 'Sun', mobileGames: 2000, pcGames: 1300, topUp: 900, giftCards: 700, aiTools: 170 },
  ];

  const categoryData = [
    { name: 'Mobile Games', value: 1200, color: '#8B5CF6' },
    { name: 'PC Games', value: 950, color: '#06B6D4' },
    { name: 'Top Up', value: 700, color: '#10B981' },
    { name: 'Gift Cards', value: 500, color: '#F59E0B' },
    { name: 'AI Tools', value: 150, color: '#F43F5E' },
  ];

  const recentOrders = [
    { id: '#12459', customer: 'Alex Johnson', amount: '$249.99', status: 'completed', time: '2 min ago' },
    { id: '#12458', customer: 'Sarah Davis', amount: '$189.50', status: 'processing', time: '5 min ago' },
    { id: '#12457', customer: 'Mike Wilson', amount: '$99.99', status: 'completed', time: '12 min ago' },
    { id: '#12456', customer: 'Emma Brown', amount: '$299.99', status: 'pending', time: '18 min ago' },
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, color, className = "" }) => (
    <div className={`bg-white rounded-lg p-6 shadow-retro border border-border hover:shadow-retro transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}%
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <div className="bg-white rounded-lg p-6 shadow-retro border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-pixel font-bold text-primary">Admin Dashboard</h1>
            {/* Mobile icons dropdown (optional) */}
            <div className="flex items-center gap-2 md:hidden">
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground w-full"
              />
            </div>
            <button className="hidden md:inline-flex p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="hidden md:inline-flex p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Time Range Selector - always side by side buttons */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors font-pixel ${
                  timeRange === range 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

        </div>

        {/* Stats Cards - fit container */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 w-full">
          <StatCard
            title="Total Sales"
            value="$12,500"
            change="4.2"
            changeType="positive"
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
            className="h-full flex-1"
          />
          <StatCard
            title="Total Sold"
            value="2,340"
            change="2.8"
            changeType="positive"
            icon={Package}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            className="h-full flex-1"
          />
          <StatCard
            title="Earnings"
            value="$8,900"
            change="3.1"
            changeType="positive"
            icon={TrendingUp}
            color="bg-gradient-to-br from-primary to-primary/80"
            className="h-full flex-1"
          />
          <StatCard
            title="Orders"
            value="1,120"
            change="1.5"
            changeType="positive"
            icon={ShoppingCart}
            color="bg-gradient-to-br from-orange-500 to-primary"
            className="h-full flex-1"
          />
        </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <ChartCard 
            title="Sales Overview"
            actions={
              <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                <option>Mobile Games</option>
                <option>PC Games</option>
                <option>Top Up</option>
                <option>Gift Cards</option>
                <option>AI Tools</option>
              </select>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Bar dataKey="mobileGames" fill="#8B5CF6" name="Mobile Games" />
                <Bar dataKey="pcGames" fill="#06B6D4" name="PC Games" />
                <Bar dataKey="topUp" fill="#10B981" name="Top Up" />
                <Bar dataKey="giftCards" fill="#F59E0B" name="Gift Cards" />
                <Bar dataKey="aiTools" fill="#F43F5E" name="AI Tools" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Categories" actions={undefined}>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{category.name}</span>
                  <span className="text-sm font-medium ml-auto">{category.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2">
            <ChartCard 
              title="Recent Orders"
              actions={
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                  View All
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      <th className="px-4 py-2 font-pixel text-xs">Order ID</th>
                      <th className="px-4 py-2 font-pixel text-xs">Customer</th>
                      <th className="px-4 py-2 font-pixel text-xs">Amount</th>
                      <th className="px-4 py-2 font-pixel text-xs">Status</th>
                      <th className="px-4 py-2 font-pixel text-xs">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="bg-background border-b border-border hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-primary font-bold">{order.id}</td>
                        <td className="px-4 py-3 text-foreground">{order.customer}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{order.amount}</td>
                        <td className="px-4 py-3">
                          {/* Custom status label with icon, no colored bg */}
                          {order.status === 'completed' && (
                            <span className="flex items-center gap-1 text-xs font-pixel font-bold text-green-700">
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Completed
                            </span>
                          )}
                          {order.status === 'processing' && (
                            <span className="flex items-center gap-1 text-xs font-pixel font-bold text-blue-700">
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#3b82f6"/><path d="M10 5v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Processing
                            </span>
                          )}
                          {order.status === 'pending' && (
                            <span className="flex items-center gap-1 text-xs font-pixel font-bold text-yellow-700">
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 7v3h3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{order.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          {/* Quick Actions */}
          <ChartCard title="Quick Actions" actions={undefined}>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-colors">
                  <Plus className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-pixel text-primary">Add Product</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-pixel text-primary">Create Order</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-colors">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-pixel text-primary">Manage Users</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group">
                <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/80 transition-colors">
                  <Eye className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-pixel text-primary">View Analytics</span>
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
  );
};

export default Dashboard;