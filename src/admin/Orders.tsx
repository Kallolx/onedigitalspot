import React, { useState, useEffect } from "react";
import {  Download, Trash2,  CheckCircle, XCircle, Clock, Package, ShieldCheck, Search, Eye, Edit, RefreshCw } from "lucide-react";
import { getAllOrders, updateOrderStatus, OrderData } from "../lib/orders";
import { mobileGames, pcGames, giftCards, aiTools, subscriptions, productivity } from "../lib/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { RotateLoader } from "react-spinners";

// Add this utility function to get product images
const getProductImage = (productName: string): string => {
  // Combine all products from all categories
  const allProducts = [
    ...mobileGames,
    ...pcGames,
    ...giftCards,
    ...aiTools,
    ...subscriptions,
    ...productivity
  ];

  // Find the product by name (case-insensitive)
  const product = allProducts.find(p => 
    p.title.toLowerCase() === productName.toLowerCase()
  );

  // Return the local image path or fallback to placeholder
  return product?.image || "/assets/placeholder.svg";
};

const Orders = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewOrder, setViewOrder] = useState<OrderData | null>(null);
  const [editOrder, setEditOrder] = useState<OrderData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states for Dialog components
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch orders from database
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrders();
      setOrders(ordersData as unknown as OrderData[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      if (!orderId || !newStatus) {
        throw new Error('Order ID and new status are required');
      }

      await updateOrderStatus(orderId, newStatus);
      
      // Update local state - handle both id and $id properties
      setOrders(orders.map(order => {
        const currentOrderId = order.$id || order.id;
        return currentOrderId === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order;
      }));
      
      setEditOrder(null);
      console.log('Order status updated successfully');
    } catch (error: any) {
      console.error("Error updating order status:", error);
      
      let errorMessage = "Failed to update order status";
      
      if (error.message?.includes('Database not found')) {
        errorMessage = "Database configuration error. Please check if the database and collection exist.";
      } else if (error.message?.includes('not configured')) {
        errorMessage = "Environment variables not configured properly.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Filtered orders with multiple filters
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.userName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderID?.toLowerCase().includes(search.toLowerCase()) ||
      order.productName.toLowerCase().includes(search.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      order.transactionId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    const matchesProductType = productTypeFilter === "all" || order.productType === productTypeFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesProductType && matchesPaymentMethod && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour(s) ago`;
    return `${Math.floor(diffInMinutes / 1440)} day(s) ago`;
  };

  // Status badge with improved styling
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      completed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle className="w-3 h-3" />,
        text: "Completed"
      },
      processing: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <Package className="w-3 h-3" />,
        text: "Processing"
      },
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: <Clock className="w-3 h-3" />,
        text: "Pending"
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: <XCircle className="w-3 h-3" />,
        text: "Cancelled"
      }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  // Enhanced bulk actions
  const BulkActions = () => (
    <div className="flex items-center gap-2">
      <select 
        onChange={(e) => {
          if (e.target.value && selected.length > 0) {
            handleBulkStatusUpdate(e.target.value);
            e.target.value = "";
          }
        }}
        className="px-3 py-1 rounded-lg border border-border font-pixel text-xs"
        defaultValue=""
      >
        <option value="">Bulk Status Update</option>
        <option value="pending">Set to Pending</option>
        <option value="processing">Set to Processing</option>
        <option value="completed">Set to Completed</option>
        <option value="cancelled">Set to Cancelled</option>
      </select>
      <button 
        onClick={handleBulkDelete}
        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-pixel text-xs"
      >
        <Trash2 className="w-4 h-4" /> Delete Selected
      </button>
      <button 
        onClick={handleBulkExport}
        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-foreground hover:bg-primary/20 font-pixel text-xs"
      >
        <Download className="w-4 h-4" /> Export Selected
      </button>
    </div>
  );

  // Bulk operations
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      // Filter out any empty or invalid order IDs
      const validOrderIds = selected.filter(id => id && id.trim() !== '');
      
      if (validOrderIds.length === 0) {
        alert('No valid orders selected for update');
        return;
      }

      for (const orderId of validOrderIds) {
        await updateOrderStatus(orderId, newStatus);
      }
      
      setOrders(orders.map(order => {
        const currentOrderId = order.$id || order.id;
        return validOrderIds.includes(currentOrderId || "")
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order;
      }));
      
      setSelected([]);
      alert(`Updated ${validOrderIds.length} orders to ${newStatus}`);
    } catch (error: any) {
      console.error("Error bulk updating orders:", error);
      alert(error?.message || "Failed to update orders");
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selected.length} orders?`)) {
      // Implement bulk delete functionality
      alert("Bulk delete functionality would be implemented here");
    }
  };

  const handleBulkExport = () => {
    const selectedOrders = orders.filter(order => selected.includes(order.id || ""));
    const csvContent = [
      "Order ID,Customer,Email,Product,Amount,Status,Date",
      ...selectedOrders.map(order => 
        `${order.orderID},${order.userName},${order.userEmail},${order.productName},${order.totalAmount},${order.status},${order.createdAt}`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Handle save status
  const handleSaveStatus = async (status: string) => {
    if (!editOrder) return;
    
    try {
      // Appwrite uses $id instead of id
      const orderId = editOrder.$id || editOrder.id;
      
      if (orderId) {
        console.log('Saving status:', { orderId, status });
        await updateOrderStatus(orderId, status);
        setShowEditModal(false);
        setEditOrder(null);
        await fetchOrders();
      } else {
        console.error('Cannot save status: missing order ID', editOrder);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
};

  // Get summary statistics
  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status.toLowerCase() === "pending").length;
    const processing = orders.filter(o => o.status.toLowerCase() === "processing").length;
    const completed = orders.filter(o => o.status.toLowerCase() === "completed").length;
    const cancelled = orders.filter(o => o.status.toLowerCase() === "cancelled").length;
    const totalRevenue = orders.filter(o => o.status.toLowerCase() === "completed").reduce((sum, order) => sum + order.totalAmount, 0);
    
    return { total, pending, processing, completed, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-pixel font-bold text-foreground">Order Management</h1>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <RotateLoader color="green" size={15} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-pixel font-bold text-foreground">Order Management</h1>
        </div>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg font-pixel"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-pixel font-bold text-foreground">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-pixel text-foreground">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-foreground" />
            <span className="font-pixel text-foreground">Export All</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-foreground font-pixel">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 font-pixel">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-muted rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 font-pixel">{stats.processing}</div>
            <div className="text-sm text-blue-700">Processing</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600 font-pixel">{stats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
            <div className="text-2xl font-bold text-red-600 font-pixel">{stats.cancelled}</div>
            <div className="text-sm text-red-700">Cancelled</div>
          </div>
          <div className="bg-primary rounded-lg p-4 border border-primary/20 shadow-sm">
            <div className="text-2xl font-bold text-foreground font-pixel">{stats.totalRevenue}৳</div>
            <div className="text-sm text-foreground/70">Revenue</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value)}
            className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Products</option>
            <option value="Mobile Games">Mobile Games</option>
            <option value="PC Games">PC Games</option>
            <option value="Gift Cards">Gift Cards</option>
            <option value="AI Tools">AI Tools</option>
            <option value="Subscriptions">Subscriptions</option>
          </select>

          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Payment Methods</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="pathaopay">Pathao Pay</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="font-pixel text-sm text-gray-600">{selected.length} orders selected</span>
            <BulkActions />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">
                  <input 
                    type="checkbox" 
                    checked={selected.length === paginatedOrders.length && paginatedOrders.length > 0} 
                    onChange={e => setSelected(e.target.checked ? paginatedOrders.map(o => o.$id || o.id || "") : [])}
                    className="rounded border-gray-300 text-foreground focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Order ID</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Payment</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 font-pixel">
                    {search || statusFilter !== "all" || productTypeFilter !== "all" || paymentMethodFilter !== "all" || dateFilter !== "all" 
                      ? "No orders match your filters" 
                      : "No orders found"
                    }
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(order.$id || order.id || "")} 
                        onChange={e => {
                          const orderId = order.$id || order.id || "";
                          setSelected(e.target.checked 
                            ? [...selected, orderId] 
                            : selected.filter(id => id !== orderId)
                          );
                        }}
                        className="rounded border-gray-300 text-foreground focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-foreground font-bold text-sm">{order.orderID}</div>
                      <div className="text-xs text-gray-500">#{(order.$id || order.id || "").slice(-8).toUpperCase()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.userName}</div>
                      <div className="text-sm text-gray-500">{order.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={getProductImage(order.productName)}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/assets/placeholder.svg";
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{order.productName}</div>
                          <div className="text-sm text-gray-500">{order.productType}</div>
                          <div className="text-xs text-gray-400">{order.itemLabel} × {order.quantity}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground font-pixel">{order.totalAmount}৳</div>
                      <div className="text-xs text-gray-500">{order.unitPrice}৳ each</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.paymentMethod}</div>
                      <div className="text-xs text-gray-500 font-mono">{order.transactionId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{timeAgo(order.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1 rounded-lg hover:bg-primary/10 transition-colors" 
                          title="View Details" 
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button 
                          className="p-1 rounded-lg hover:bg-blue-100 transition-colors" 
                          title="Edit Status" 
                          onClick={() => {
                            console.log('Edit button clicked for order:', order);
                            console.log('Order ID:', order.id);
                            setEditOrder(order);
                          }}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button 
                          className="p-1 rounded-lg hover:bg-red-100 transition-colors" 
                          title="Delete Order"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this order?")) {
                              // Implement delete functionality
                              alert("Delete functionality would be implemented here");
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
            </span>
            {filteredOrders.length !== orders.length && (
              <span className="text-xs text-gray-500">
                (filtered from {orders.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-white border border-gray-300 font-pixel text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="font-pixel text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg bg-white border border-gray-300 font-pixel text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
            <select 
              value={pageSize} 
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} 
              className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Order Details Modal */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-foreground">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image Section */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductImage(viewOrder.productName)}
                    alt={viewOrder.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/placeholder.svg";
                    }}
                  />
                </div>
              </div>

              {/* Order Details Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-pixel text-2xl text-foreground mb-2">
                    {viewOrder.productName}
                  </h3>
                  <Badge variant="secondary" className="font-pixel">
                    {viewOrder.productType}
                  </Badge>
                </div>

                {/* Order Information */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Order ID:</span>
                      <div className="font-mono font-bold text-foreground">{viewOrder.orderID}</div>
                    </div>
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Status:</span>
                      <div className="mt-1"><StatusBadge status={viewOrder.status} /></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Customer:</span>
                      <div className="font-medium text-foreground">{viewOrder.userName}</div>
                      <div className="text-sm text-muted-foreground">{viewOrder.userEmail}</div>
                    </div>
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Created:</span>
                      <div className="text-sm text-foreground">{new Date(viewOrder.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Item:</span>
                      <div className="text-sm text-foreground">{viewOrder.itemLabel}</div>
                      <div className="text-xs text-muted-foreground">Quantity: {viewOrder.quantity}</div>
                    </div>
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Amount:</span>
                      <div className="font-bold text-foreground font-pixel">{viewOrder.totalAmount}৳</div>
                      <div className="text-xs text-muted-foreground">{viewOrder.unitPrice}৳ each</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Payment Method:</span>
                      <div className="font-medium text-foreground">{viewOrder.paymentMethod}</div>
                      <div className="text-xs text-muted-foreground font-mono">Transaction: {viewOrder.transactionId}</div>
                    </div>
                  </div>

                  {viewOrder.deliveryInfo && (
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Delivery Information:</span>
                      <div className="text-sm text-foreground bg-muted p-3 rounded-lg mt-1">
                        {viewOrder.deliveryInfo}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => setViewOrder(null)}
                    className="font-pixel"
                  >
                    Close
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => { 
                      window.open('/admin/receipt-verifier', '_blank');
                    }}
                    className="font-pixel"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Send Item
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => { 
                      setEditOrder(viewOrder); 
                      setViewOrder(null); 
                    }}
                    className="font-pixel"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Status Modal */}
      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl text-foreground">
              Edit Order Status
            </DialogTitle>
          </DialogHeader>
          {editOrder && (
            <div className="space-y-4">
              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Order ID</label>
                <div className="px-3 py-2 bg-muted rounded-lg font-mono text-foreground font-bold">
                  {editOrder.orderID}
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Product</label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background flex-shrink-0">
                    <img
                      src={getProductImage(editOrder.productName)}
                      alt={editOrder.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder.svg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{editOrder.productName}</div>
                    <div className="text-sm text-muted-foreground">{editOrder.itemLabel}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Customer</label>
                <div className="px-3 py-2 bg-muted rounded-lg">
                  <div className="font-medium text-foreground">{editOrder.userName}</div>
                  <div className="text-sm text-muted-foreground">{editOrder.userEmail}</div>
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Current Status</label>
                <div className="px-3 py-2 bg-muted rounded-lg">
                  <StatusBadge status={editOrder.status} />
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">New Status</label>
                <select
                  className="w-full font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={editOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus && newStatus !== editOrder.status) {
                      if (confirm(`Change order status from "${editOrder.status}" to "${newStatus}"?`)) {
                        handleSaveStatus(newStatus);
                      }
                    }
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setEditOrder(null)}
                  className="font-pixel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
