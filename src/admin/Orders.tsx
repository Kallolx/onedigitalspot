import React, { useState, useEffect } from "react";
import {  Download, Trash2,  CheckCircle, XCircle, Clock, Package, ShieldCheck, Search, Eye, Edit, RefreshCw, MessageCircle, Mail, Send } from "lucide-react";
import { getAllOrders, updateOrderStatus, OrderData, deleteOrder } from "../lib/orders";
import { mobileGames, pcGames, giftCards, aiTools, subscriptions, productivity } from "../lib/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { RotateLoader } from "react-spinners";

// Add this utility function to get product images (fuzzy matching)
const getProductImage = (productName: string): string => {
  // Combine all products from all categories
  const allProducts = [
    ...mobileGames,
    ...pcGames,
    ...giftCards,
    ...aiTools,
    ...subscriptions,
    ...productivity,
  ];

  const name = (productName || "").toString().trim().toLowerCase();

  // Try exact match, then fuzzy includes (both directions)
  const product = allProducts.find((p) => {
    const title = (p.title || "").toLowerCase();
    return (
      title === name ||
      title.includes(name) ||
      name.includes(title)
    );
  });

  if (!product && name) {
    // dev-time hint
    console.warn(`[Admin Orders] no product mapping found for "${name}"`);
  }

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
  // Custom status change confirmation dialog
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  // Custom delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

  // Parse deliveryInfo field which may be a compact JSON string or plain text
  const parseDeliveryInfo = (deliveryInfo: any) => {
    if (!deliveryInfo) return { method: null, contact: null, deliveredAt: null, deliveryStatus: null, raw: null };
    let raw = deliveryInfo;
    try {
      if (typeof deliveryInfo === 'string') {
        const maybe = deliveryInfo.trim();
        if ((maybe.startsWith('{') && maybe.endsWith('}')) || (maybe.startsWith('[') && maybe.endsWith(']'))) {
          const obj = JSON.parse(maybe);
          return {
            method: obj.method || null,
            contact: obj.contact || obj.phone || obj.email || null,
            deliveredAt: obj.deliveredAt || obj.delivered_at || null,
            deliveryStatus: obj.deliveryStatus || obj.delivery_status || obj.deliveryStatus || null,
            raw: maybe,
          };
        }
        // fallback: treat as plain contact string
        return { method: null, contact: maybe, deliveredAt: null, deliveryStatus: null, raw: maybe };
      }
      if (typeof deliveryInfo === 'object') {
        return {
          method: deliveryInfo.method || null,
          contact: deliveryInfo.contact || deliveryInfo.phone || deliveryInfo.email || null,
          deliveredAt: deliveryInfo.deliveredAt || deliveryInfo.delivered_at || null,
          deliveryStatus: deliveryInfo.deliveryStatus || deliveryInfo.delivery_status || null,
          raw: JSON.stringify(deliveryInfo),
        };
      }
    } catch (err) {
      console.warn('Failed to parse deliveryInfo', err, deliveryInfo);
      return { method: null, contact: String(deliveryInfo), deliveredAt: null, deliveryStatus: null, raw: String(deliveryInfo) };
    }
    return { method: null, contact: String(deliveryInfo), deliveredAt: null, deliveryStatus: null, raw: String(deliveryInfo) };
  };

  // Format delivery contact for display (Bangladesh numbers get +880 prefix if local)
  const formatDeliveryContact = (contact: any) => {
    if (!contact) return '';
    const s = String(contact).replace(/[^0-9+]/g, '');
    if (s.startsWith('+')) return s;
    if (s.startsWith('00')) return '+' + s.slice(2);
    if (s.startsWith('0') && s.length >= 10) {
      // local BD number like 01630582639 -> +8801630582639
      return '+88' + s.slice(1);
    }
    if (s.startsWith('880')) return '+' + s;
    // fallback: add + if looks international length
    return s.length >= 10 ? '+' + s : s;
  };

  // Handle delivery method redirection based on method type
  const handleDeliveryRedirect = (deliveryInfo: any) => {
    if (!deliveryInfo) return;
    
    const info = parseDeliveryInfo(deliveryInfo);
    if (!info.method || !info.contact) return;
    
    const method = info.method.toLowerCase();
    const contact = info.contact;
    
    if (method.includes('whatsapp') || method.includes('wa')) {
      // Format phone number for WhatsApp
      let phoneNumber = contact.replace(/[^0-9+]/g, '');
      if (phoneNumber.startsWith('0') && phoneNumber.length >= 10) {
        phoneNumber = '+88' + phoneNumber.slice(1); // Bangladesh format
      } else if (phoneNumber.startsWith('880')) {
        phoneNumber = '+' + phoneNumber;
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    } else if (method.includes('email') || method.includes('mail')) {
      // Open default email client
      window.open(`mailto:${contact}`, '_blank');
    } else if (method.includes('telegram') || method.includes('tg')) {
      // Handle Telegram (if contact is username)
      const username = contact.startsWith('@') ? contact.slice(1) : contact;
      window.open(`https://t.me/${username}`, '_blank');
    } else if (method.includes('facebook') || method.includes('fb')) {
      // Handle Facebook (if contact is profile URL or username)
      if (contact.includes('facebook.com')) {
        window.open(contact, '_blank');
      } else {
        window.open(`https://facebook.com/${contact}`, '_blank');
      }
    } else {
      // For other methods, try to detect if it's a phone number and open WhatsApp
      if (/^[0-9+\-\s()]+$/.test(contact)) {
        let phoneNumber = contact.replace(/[^0-9+]/g, '');
        if (phoneNumber.startsWith('0') && phoneNumber.length >= 10) {
          phoneNumber = '+88' + phoneNumber.slice(1);
        } else if (phoneNumber.startsWith('880')) {
          phoneNumber = '+' + phoneNumber;
        } else if (!phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber;
        }
        window.open(`https://wa.me/${phoneNumber}`, '_blank');
      } else {
        // Fallback: show alert with contact info
        alert(`Contact: ${contact}\nMethod: ${info.method}`);
      }
    }
  };

  // Extract playerId and zoneId from various shapes (top-level, payload, details, stringified JSON)
  const extractPlayerZone = (order: any) => {
    if (!order) return { playerId: null, zoneId: null };

    const tryGet = (obj: any) => {
      // Only accept explicit player/zone identifiers — do NOT treat userId as playerId
      if (!obj || typeof obj !== 'object') return { playerId: null, zoneId: null };
      const playerId = obj.playerId || obj.player_id || obj.player?.id || obj.player?.playerId || null;
      const zoneId = obj.zoneId || obj.zone_id || obj.zone?.id || obj.zone?.zoneId || null;
      return { playerId, zoneId };
    };

    const candidates = [order, order.payload, order.details, order.meta, order.data];

    for (let cand of candidates) {
      if (!cand) continue;
      // if string, try parse JSON
      if (typeof cand === 'string') {
        const s = cand.trim();
        if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
          try {
            cand = JSON.parse(s);
          } catch (e) {
            // not JSON
            continue;
          }
        } else {
          continue;
        }
      }

      const found = tryGet(cand);
      if (found.playerId || found.zoneId) return { playerId: String(found.playerId || '').trim() || null, zoneId: String(found.zoneId || '').trim() || null };
      // also check nested payload.player or payload.meta
      if (cand.player && typeof cand.player === 'object') {
        const f = tryGet(cand.player);
        if (f.playerId || f.zoneId) return { playerId: String(f.playerId || '').trim() || null, zoneId: String(f.zoneId || '').trim() || null };
      }
      if (cand.meta && typeof cand.meta === 'object') {
        const f = tryGet(cand.meta);
        if (f.playerId || f.zoneId) return { playerId: String(f.playerId || '').trim() || null, zoneId: String(f.zoneId || '').trim() || null };
      }
    }

    return { playerId: null, zoneId: null };
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
  // open custom bulk delete dialog
  if (selected.length === 0) return;
  setDeleteTargetId('BULK:' + selected.join(','));
  setShowDeleteConfirm(true);
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
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Order ID</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Payment</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-pixel text-xs text-gray-600 uppercase tracking-wide">Delivery</th>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={order.productImage || getProductImage(order.productName)}
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
                          <div className="text-xs text-gray-400">{order.itemLabel} × {order.quantity}</div>
                        </div>
                      </div>
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
                      {(() => {
                        const info = parseDeliveryInfo(order.deliveryInfo);
                        return (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{info.method ? info.method.toUpperCase() : '—'}</span>
                            <span className="text-xs text-gray-500">{info.contact || 'No contact'}</span>
                          </div>
                        );
                      })()}
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
                            const id = order.$id || order.id || '';
                            setDeleteTargetId(id);
                            setShowDeleteConfirm(true);
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
                    src={viewOrder.productImage || getProductImage(viewOrder.productName)}
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
                </div>

                {/* Order Information */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">Order ID:</span>
                      <div className="font-sans font-bold text-secondary">{viewOrder.orderID}</div>
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
                      <span className="font-pixel text-xs text-muted-foreground">Payment Method:</span>
                      <div className="font-medium text-foreground">{viewOrder.paymentMethod}</div>
                      <div className="text-xs text-muted-foreground font-mono">Transaction: {viewOrder.transactionId}</div>
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
                      <span className="font-pixel text-xs text-muted-foreground">Created:</span>
                      <div className="text-sm text-foreground">{new Date(viewOrder.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  {viewOrder.deliveryInfo && (() => {
                    const info = parseDeliveryInfo(viewOrder.deliveryInfo);
                    return (
                      <div>
                        <span className="font-sans text-xs text-muted-foreground">Delivery Information:</span>
                        <div className="text-sm text-foreground bg-muted p-3 rounded-lg mt-1 flex items-center justify-between">
                          <div>
                            <div><strong>Method:</strong> {info.method ? info.method : '—'}</div>
                            <div><strong>Contact:</strong> {info.contact || '—'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Player / Zone info */}
                {(() => {
                  const { playerId, zoneId } = extractPlayerZone(viewOrder as any);
                  if (!playerId && !zoneId) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Player ID</div>
                        <div className="font-mono font-bold">{playerId || '\u2014'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Zone ID</div>
                        <div className="font-mono font-bold">{zoneId || '\u2014'}</div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="default"
                    onClick={() => { 
                      if (viewOrder.deliveryInfo) {
                        handleDeliveryRedirect(viewOrder.deliveryInfo);
                      } else {
                        alert('No delivery information available for this order.');
                      }
                    }}
                    className="font-pixel"
                    title={`Send item via ${(() => {
                      const info = parseDeliveryInfo(viewOrder.deliveryInfo);
                      return info.method || 'delivery method';
                    })()}`}
                  >
                    {(() => {
                      const info = parseDeliveryInfo(viewOrder.deliveryInfo);
                      if (info.method) {
                        if (info.method.toLowerCase().includes('whatsapp')) return <MessageCircle className="w-4 h-4 mr-2" />;
                        if (info.method.toLowerCase().includes('email')) return <Mail className="w-4 h-4 mr-2" />;
                        if (info.method.toLowerCase().includes('telegram')) return <MessageCircle className="w-4 h-4 mr-2" />;
                        return <Send className="w-4 h-4 mr-2" />;
                      }
                      return <ShieldCheck className="w-4 h-4 mr-2" />;
                    })()}
                    {(() => {
                      const info = parseDeliveryInfo(viewOrder.deliveryInfo);
                      if (info.method) {
                        if (info.method.toLowerCase().includes('whatsapp')) return 'Send via WhatsApp';
                        if (info.method.toLowerCase().includes('email')) return 'Send via Email';
                        if (info.method.toLowerCase().includes('telegram')) return 'Send via Telegram';
                        return `Send via ${info.method}`;
                      }
                      return 'Send Item';
                    })()}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-pixel text-lg text-foreground">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Do you really want to delete {deleteTargetId?.startsWith('BULK:') ? `${selected.length} selected orders` : `this order`}? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}>No</Button>
              <Button variant="destructive" onClick={async () => {
                try {
                  // If bulk
                  if (deleteTargetId?.startsWith('BULK:')) {
                    const ids = deleteTargetId.replace('BULK:', '').split(',').map(s => s.trim()).filter(Boolean);
                    for (const id of ids) {
                      await deleteOrder(id);
                    }
                    setOrders(orders.filter(o => !ids.includes(o.$id || o.id || '')));
                    setSelected([]);
                  } else if (deleteTargetId) {
                    await deleteOrder(deleteTargetId);
                    setOrders(orders.filter(o => (o.$id || o.id || '') !== deleteTargetId));
                  }
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                } catch (err: any) {
                  console.error('Delete failed', err);
                  alert('Delete failed: ' + (err?.message || 'Unknown error'));
                }
              }}>Delete</Button>
            </div>
          </div>
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
                <div className="px-3 py-2 bg-background border border-border rounded-lg font-mono text-foreground font-bold">
                  {editOrder.orderID}
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Product</label>
                <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-background flex-shrink-0">
                    <img
                      src={editOrder.productImage || getProductImage(editOrder.productName)}
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
                <div className="px-3 py-2 bg-background border border-border rounded-lg">
                  <div className="font-medium text-foreground">{editOrder.userName}</div>
                  <div className="text-sm text-muted-foreground">{editOrder.userEmail}</div>
                </div>
              </div>

              <div>
                <label className="font-pixel text-xs text-muted-foreground mb-2 block">Current Status</label>
                <div className="px-3 py-2 bg-background border border-border rounded-lg">
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
                      // open custom confirmation dialog instead of browser confirm
                      setPendingStatus(newStatus);
                      setShowStatusConfirm(true);
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

      {/* Custom Confirm Dialog for Status Change */}
      <Dialog open={showStatusConfirm} onOpenChange={(open) => !open && setShowStatusConfirm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-pixel text-lg text-foreground">Confirm Status Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Are you sure you want to change the order status{editOrder ? ` for ${editOrder.orderID}` : ''} to <strong className="capitalize">{pendingStatus}</strong>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowStatusConfirm(false); setPendingStatus(null); }}>No</Button>
              <Button variant="default" onClick={async () => {
                if (pendingStatus) {
                  await handleSaveStatus(pendingStatus);
                }
                setShowStatusConfirm(false);
                setPendingStatus(null);
              }}>Yes, change</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
