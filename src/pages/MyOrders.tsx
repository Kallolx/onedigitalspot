import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { getUserOrders, getCurrentUser, OrderData } from "../lib/orders";
import ReceiptGenerator from "../components/ReceiptGenerator";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TruckIcon, 
  ShoppingBagIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  CalendarIcon,
  CreditCardIcon,
  PackageIcon,
  PhoneIcon,
} from "lucide-react";
import { RotateLoader } from "react-spinners";

// Timer component for pending orders
const DeliveryTimer = ({ createdAt, status }: { createdAt: string; status: string }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (status.toLowerCase() !== 'pending') return;

    const calculateTimeLeft = () => {
      const orderTime = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - orderTime;
      
      // 30 minutes = 1800000ms
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (elapsed < thirtyMinutes) {
        // Within 30 minutes - show countdown timer
        const remaining = thirtyMinutes - elapsed;
        setShowTimer(true);
        setTimeLeft({
          minutes: Math.floor(remaining / 60000),
          seconds: Math.floor((remaining % 60000) / 1000)
        });
      } else {
        // Over 30 minutes - don't show timer
        setShowTimer(false);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  // If not pending or over 30 minutes, don't show timer
  if (status.toLowerCase() !== 'pending' || !showTimer) {
    return null;
  }

  const formatTime = (minutes: number, seconds: number) => {
    const mins = minutes.toString().padStart(2, '0');
    const secs = seconds.toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
      <ClockIcon className="w-4 h-4" />
      <span className="text-xs">Delivery</span>
      <span className="font-mono text-lg font-black">{formatTime(timeLeft.minutes, timeLeft.seconds)}</span>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const navigate = useNavigate();

  // Enhanced timer component for order details modal
  const DetailedDeliveryTimer = ({ createdAt, status }: { createdAt: string; status: string }) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
    const [showTimer, setShowTimer] = useState(false);

    useEffect(() => {
      if (status.toLowerCase() !== 'pending') return;

      const calculateTimeLeft = () => {
        const orderTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const elapsed = now - orderTime;
        
        // 30 minutes = 1800000ms
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (elapsed < thirtyMinutes) {
          // Within 30 minutes - show countdown timer
          const remaining = thirtyMinutes - elapsed;
          setShowTimer(true);
          setTimeLeft({
            minutes: Math.floor(remaining / 60000),
            seconds: Math.floor((remaining % 60000) / 1000)
          });
        } else {
          // Over 30 minutes - don't show timer
          setShowTimer(false);
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(interval);
    }, [createdAt, status]);

    // If not pending, show normal status badge
    if (status.toLowerCase() !== 'pending') {
      return (
        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit mt-2`}>
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </Badge>
      );
    }

    // If pending but over 30 minutes, show processing badge
    if (!showTimer) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 w-fit mt-2">
          <TruckIcon className="w-4 h-4" />
          <span>Processing</span>
        </Badge>
      );
    }

    // Show timer only (no icon, no label, no bg, no padding)
    const formatTime = (minutes: number, seconds: number) => {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <span className="font-mono font-black text-xl text-green-700">
        {formatTime(timeLeft.minutes, timeLeft.seconds)}
      </span>
    );
  };

  useEffect(() => {
    const fetchOrdersAndUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        const userOrders = await getUserOrders(currentUser.$id);
        const ordersData = userOrders as unknown as OrderData[];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
        // If user is not authenticated, redirect to login
        if (error.message?.includes("unauthorized") || error.message?.includes("401")) {
          navigate("/auth/login?redirect=" + encodeURIComponent("/my-orders"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndUser();
  }, [navigate]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderID?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "confirmed":
      case "processing":
        return <TruckIcon className="w-4 h-4" />;
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "cancelled":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShoppingBagIcon className="w-4 h-4" />;
    }
  };

  const getStatusDisplay = (order: OrderData) => {
    // Check if it's pending and within 30 minutes
    if (order.status.toLowerCase() === 'pending') {
      const orderTime = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - orderTime;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (elapsed < thirtyMinutes) {
        // Show timer for pending orders within 30 minutes
        return <DeliveryTimer createdAt={order.createdAt} status={order.status} />;
      } else {
        // Show processing badge for pending orders over 30 minutes
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 w-fit">
            <TruckIcon className="w-4 h-4" />
            <span>Processing</span>
          </Badge>
        );
      }
    }
    
    // Show normal status badge for non-pending orders
    return (
      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
        {getStatusIcon(order.status)}
        <span className="capitalize">{order.status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderSummary = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status.toLowerCase() === "pending").length;
    const completed = orders.filter(o => o.status.toLowerCase() === "completed").length;
    const processing = orders.filter(o => o.status.toLowerCase() === "processing").length;
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return { total, pending, completed, processing, totalAmount };
  };

  const summary = getOrderSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header + Search/Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl tracking-tighter font-bold text-gray-900 font-pixel">
                My Orders
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage all your orders in one place
              </p>
            </div>
            {/* Search and Filter Bar */}
            {!loading && !error && orders.length > 0 && (
              <div className="flex flex-row gap-2 items-end w-full md:w-auto md:max-w-xl">
                <div className="relative flex-1 max-w-[220px]">
                  <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {!loading && !error && orders.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="p-6 bg-primary text-white shadow-retro">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold font-pixel">{summary.total}</p>
                  </div>
                  <PackageIcon className="w-10 h-10 text-primary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-primary text-white shadow-retro">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold font-pixel">{summary.pending}</p>
                  </div>
                  <ClockIcon className="w-10 h-10 text-primary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-primary text-white shadow-retro">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold font-pixel">{summary.completed}</p>
                  </div>
                  <CheckCircleIcon className="w-10 h-10 text-primary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-primary text-white shadow-retro">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Total Spent</p>
                    <p className="text-3xl font-bold font-pixel">{summary.totalAmount}৳</p>
                  </div>
                </div>
              </Card>
            </div>
          )}


          {/* Loading State */}
          {loading && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <RotateLoader color="#22c55e" size={15} />
                <p className="text-gray-600 mt-4">Loading your orders...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-12">
              <div className="text-center">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders. Start shopping to see your orders here!
                </p>
                <Button onClick={() => navigate("/")} className="font-pixel">
                  Start Shopping
                </Button>
              </div>
            </Card>
          )}

          {/* Orders Table - Desktop */}
          {!loading && !error && filteredOrders.length > 0 && (
            <>
              <Card className="hidden lg:block overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Game Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={order.productImage}
                                  alt={order.productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/assets/placeholder.svg";
                                  }}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 font-pixel">
                                  {order.productName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.itemLabel} × {order.quantity}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {order.orderID || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {order.playerId && (
                                <p className="text-gray-900">
                                  <span className="font-medium">Player ID:</span> {order.playerId}
                                </p>
                              )}
                              {order.zoneId && (
                                <p className="text-gray-900">
                                  <span className="font-medium">Zone ID:</span> {order.zoneId}
                                </p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                <CalendarIcon className="w-3 h-3 inline mr-1" />
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900 font-medium">{order.paymentMethod}</p>
                              <p className="text-gray-500 text-xs">TRX: {order.transactionId}</p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {getStatusDisplay(order)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 font-pixel">
                                {order.totalAmount}৳
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.unitPrice}৳ × {order.quantity}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-center gap-1"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View
                              </Button>
                              {order.status.toLowerCase() === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    navigate(`/${order.productType.toLowerCase().replace(' ', '-')}/${order.productName.toLowerCase().replace(' ', '-')}`);
                                  }}
                                >
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Orders Cards - Mobile */}
              <div className="lg:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/assets/placeholder.svg";
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 font-pixel">
                              {order.productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {order.itemLabel} × {order.quantity}
                            </p>
                          </div>
                        </div>
                        {getStatusDisplay(order)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Order ID</p>
                          <p className="text-gray-900">{order.orderID || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Amount</p>
                          <p className="text-gray-900 font-bold font-pixel">{order.totalAmount}৳</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Payment</p>
                          <p className="text-gray-900">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Date</p>
                          <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {/* Game Info */}
                      {(order.playerId || order.zoneId) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Game Details
                          </p>
                          <div className="space-y-1 text-sm">
                            {order.playerId && (
                              <p className="text-gray-900">
                                <span className="font-medium">Player ID:</span> {order.playerId}
                              </p>
                            )}
                            {order.zoneId && (
                              <p className="text-gray-900">
                                <span className="font-medium">Zone ID:</span> {order.zoneId}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 flex-1"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View Details
                        </Button>
                        {order.status.toLowerCase() === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigate(`/${order.productType.toLowerCase().replace(' ', '-')}/${order.productName.toLowerCase().replace(' ', '-')}`);
                            }}
                            className="flex-1"
                          >
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4">
          <Card className="w-full max-w-2xl h-[70dvh] sm:h-auto max-h-[90dvh] sm:max-h-[90vh] flex flex-col mx-0 sm:mx-0">
            {/* Sticky Header */}
            <div className="sticky rounded-lg top-0 z-10 bg-white p-4 sm:p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 font-pixel">Order Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
              {/* Product Info */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-gray-50 rounded-lg p-4">
                <div className="flex flex-row items-center w-full gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={selectedOrder.productImage}
                      alt={selectedOrder.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-left flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap w-full">
                      <h3 className="text-base font-semibold text-gray-900 font-pixel truncate">
                        {selectedOrder.productName}
                      </h3>
                      {/* Status badge/timer - beside name on all screens, right-aligned on mobile */}
                      <span className="sm:hidden flex-1 flex justify-end">
                        <DetailedDeliveryTimer createdAt={selectedOrder.createdAt} status={selectedOrder.status} />
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate">
                      {selectedOrder.itemLabel} × {selectedOrder.quantity}
                    </p>
                  </div>
                  {/* Status badge/timer - right on desktop */}
                  <div className="hidden sm:block sm:ml-auto">
                    <DetailedDeliveryTimer createdAt={selectedOrder.createdAt} status={selectedOrder.status} />
                  </div>
                </div>
                {/* Receipt Generator - Full width on mobile */}
                <div className="w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0">
                  <ReceiptGenerator 
                    order={selectedOrder} 
                    userName={user?.name || "Guest User"}
                    userEmail={user?.email || "guest@example.com"}
                  />
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-mono">{selectedOrder.orderID || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Product Type:</span>
                        <span>{selectedOrder.productType}</span>
                      </div>
                    </div>
                  </div>

                  {(selectedOrder.playerId || selectedOrder.zoneId) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Game Details</h4>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.playerId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Player ID:</span>
                            <span className="font-mono">{selectedOrder.playerId}</span>
                          </div>
                        )}
                        {selectedOrder.zoneId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Zone ID:</span>
                            <span className="font-mono">{selectedOrder.zoneId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account:</span>
                        <span className="font-mono">{selectedOrder.paymentAccountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono">{selectedOrder.transactionId}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Amount Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unit Price:</span>
                        <span>{selectedOrder.unitPrice}৳</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span>{selectedOrder.quantity}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-primary text-2xl font-pixel">={selectedOrder.totalAmount}৳</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 rounded-lg z-10 bg-white p-4 border-t flex gap-3">
              {selectedOrder.status.toLowerCase() === "pending" && (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    alert("Contact support to cancel this order.");
                  }}
                >
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              )}
              {selectedOrder.status.toLowerCase() === "completed" && (
                <Button
                  className="flex-1 font-pixel"
                  onClick={() => {
                    navigate(`/${selectedOrder.productType.toLowerCase().replace(' ', '-')}/${selectedOrder.productName.toLowerCase().replace(' ', '-')}`);
                    setSelectedOrder(null);
                  }}
                >
                  Order Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
