import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/landing/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { getUserOrders, getCurrentUser, OrderData } from "../lib/orders";
import {
  mobileGames,
  pcGames,
  giftCards,
  aiTools,
  subscriptions,
  productivity,
} from "../lib/products";
import ReceiptGenerator from "../components/custom/ReceiptGenerator";
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
  Coins,
} from "lucide-react";
import { RotateLoader } from "react-spinners";

// Utility function to get local image path from product name
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

  // Find the product by name (case-insensitive)
  const product = allProducts.find(
    (p) => p.title.toLowerCase() === productName.toLowerCase()
  );

  // Return the local image path or fallback to placeholder
  return product?.image || "/assets/placeholder.svg";
};

// Timer component for pending orders
const DeliveryTimer = ({
  createdAt,
  status,
}: {
  createdAt: string;
  status: string;
}) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (status.toLowerCase() !== "pending") return;

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
          seconds: Math.floor((remaining % 60000) / 1000),
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
  if (status.toLowerCase() !== "pending" || !showTimer) {
    return null;
  }

  const formatTime = (minutes: number, seconds: number) => {
    const mins = minutes.toString().padStart(2, "0");
    const secs = seconds.toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
      <ClockIcon className="w-4 h-4" />
      <span className="text-xs">Delivery</span>
      <span className="font-mono text-lg font-black">
        {formatTime(timeLeft.minutes, timeLeft.seconds)}
      </span>
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
  const DetailedDeliveryTimer = ({
    createdAt,
    status,
  }: {
    createdAt: string;
    status: string;
  }) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
    const [showTimer, setShowTimer] = useState(false);

    useEffect(() => {
      if (status.toLowerCase() !== "pending") return;

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
            seconds: Math.floor((remaining % 60000) / 1000),
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
    if (status.toLowerCase() !== "pending") {
      return (
        <Badge
          className={`${getStatusColor(
            status
          )} flex items-center gap-1 w-fit mt-2`}
        >
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
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
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
        if (
          error.message?.includes("unauthorized") ||
          error.message?.includes("401")
        ) {
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
      filtered = filtered.filter(
        (order) =>
          order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.transactionId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.orderID?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter
      );
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
    if (order.status.toLowerCase() === "pending") {
      const orderTime = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - orderTime;
      const thirtyMinutes = 30 * 60 * 1000;

      if (elapsed < thirtyMinutes) {
        // Show timer for pending orders within 30 minutes
        return (
          <DeliveryTimer createdAt={order.createdAt} status={order.status} />
        );
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
      <Badge
        className={`${getStatusColor(
          order.status
        )} flex items-center gap-1 w-fit`}
      >
        {getStatusIcon(order.status)}
        <span className="capitalize">{order.status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string, p0: string) => {
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
    const pending = orders.filter(
      (o) => o.status.toLowerCase() === "pending"
    ).length;
    const completed = orders.filter(
      (o) => o.status.toLowerCase() === "completed"
    ).length;
    const processing = orders.filter(
      (o) => o.status.toLowerCase() === "processing"
    ).length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return { total, pending, completed, processing, totalAmount };
  };

  const summary = getOrderSummary();

  return (
    <div className="bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header + Search/Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl tracking-tighter font-bold text-gray-900 font-pixel">
                My Orders
              </h1>

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
                    className="pl-10 pr-2 py-2 text-sm border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  >
                    <option value="all">All Orders</option>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {/* Total Orders */}
            <Card className="flex items-center p-4 bg-background rounded-2xl justify-center sm:justify-start">
              <div className="p-4 flex items-center justify-center hidden sm:flex">
                <PackageIcon className="w-8 h-8 text-foreground" />
              </div>
              <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                <p className="text-sm font-medium text-foreground/70">
                  Total Orders
                </p>
                <p className="text-2xl font-bold font-pixel text-foreground">
                  {summary.total}
                </p>
              </div>
            </Card>

            {/* Pending */}
            <Card className="flex items-center p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
              <div className="p-4 flex items-center justify-center hidden sm:flex">
                <ClockIcon className="w-8 h-8 text-foreground" />
              </div>
              <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                <p className="text-sm font-medium text-foreground/70">
                  Pending
                </p>
                <p className="text-2xl font-bold font-pixel text-foreground">
                  {summary.pending}
                </p>
              </div>
            </Card>

            {/* Completed */}
            <Card className="flex items-center p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
              <div className="p-4 flex items-center justify-center hidden sm:flex">
                <CheckCircleIcon className="w-8 h-8 text-foreground" />
              </div>
              <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                <p className="text-sm font-medium text-foreground/70">
                  Completed
                </p>
                <p className="text-2xl font-bold font-pixel text-foreground">
                  {summary.completed}
                </p>
              </div>
            </Card>

            {/* Total Spent */}
            <Card className="flex items-center p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
              <div className="p-4 bg-yellow-500/20 rounded-full flex items-center justify-center hidden sm:flex">
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                <p className="text-sm font-medium text-foreground/70">
                  Total Spent
                </p>
                <p className="text-2xl font-bold font-pixel text-foreground">
                  {summary.totalAmount}৳
                </p>
              </div>
            </Card>
          </div>

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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Failed to Load Orders
                </h3>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders. Start shopping to see your
                  orders here!
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
              <Card className="hidden lg:block overflow-hidden shadow-md rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Game Info
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Order Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                              <div className="flex flex-col">
                                <span className="text-gray-900 font-pixel font-semibold">
                                  {order.productName}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {order.itemLabel} × {order.quantity}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {order.orderID || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Game Info */}
                          <td className="px-6 py-4 space-y-1">
                            {order.playerId && (
                              <p className="text-gray-900">
                                <span className="font-medium">Player ID:</span>{" "}
                                {order.playerId}
                              </p>
                            )}
                            {order.zoneId && (
                              <p className="text-gray-900">
                                <span className="font-medium">Zone ID:</span>{" "}
                                {order.zoneId}
                              </p>
                            )}
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                              <CalendarIcon className="w-3 h-3" />{" "}
                              {formatDate(order.createdAt, "date")}
                            </p>
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4">
                            <p className="text-gray-900 font-medium">
                              {order.paymentMethod}
                            </p>
                            <p className="text-gray-400 text-xs">
                              TRX: {order.transactionId}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {getStatusDisplay(order)}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <p className="text-gray-900 font-bold font-pixel">
                              {order.totalAmount}৳
                            </p>
                            <p className="text-gray-400 text-xs">
                              {order.unitPrice}৳ × {order.quantity}
                            </p>
                          </td>

                          {/* Actions */}
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
                                  onClick={() =>
                                    navigate(
                                      `/${order.productType
                                        .toLowerCase()
                                        .replace(" ", "-")}/${order.productName
                                        .toLowerCase()
                                        .replace(" ", "-")}`
                                    )
                                  }
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
    <Card
      key={order.id}
      className="p-4 hover:shadow-lg transition-shadow rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
          <h3 className="font-pixel font-semibold text-gray-900">
            {order.productName}
          </h3>
          <p className="text-gray-500 text-sm">
            {order.itemLabel} × {order.quantity}
          </p>
        </div>
      </div>

      {/* Body Grid with vertical divider */}
      <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-200 py-2">
        {/* Left Column */}
        <div className="border-r border-gray-200 pr-3">
          <p className="text-gray-500 font-medium">Amount</p>
          <p className="text-secondary font-pixel font-bold">৳{order.totalAmount}</p>

          <p className="text-gray-500 font-medium mt-2">Date</p>
          <p className="text-gray-900">{formatDate(order.createdAt, "date")}</p>
        </div>

        {/* Right Column */}
        <div className="pl-3">
          <p className="text-gray-500 font-medium">Payment</p>
          <p className="text-gray-900">{order.paymentMethod}</p>

          <p className="text-gray-500 font-medium mt-2">Product</p>
          <p className="text-gray-900">{order.productName}</p>
        </div>
      </div>

      {/* Game Details / Player ID */}
      {(order.playerId || order.zoneId) && (
        <div className="mt-3 text-sm text-gray-700">
          {order.playerId && (
            <p>
              <span className="font-medium">Player ID:</span> {order.playerId}
            </p>
          )}
          {order.zoneId && (
            <p>
              <span className="font-medium">Zone ID:</span> {order.zoneId}
            </p>
          )}
        </div>
      )}

      {/* Status and View Button */}
      <div className="flex items-center justify-between mt-3">
        <div className="bg-gray-100 rounded-lg text-left font-semibold text-lg">
          {getStatusDisplay(order)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrder(order)}
          className="flex items-center gap-1"
        >
          <EyeIcon className="w-4 h-4" /> View
        </Button>
      </div>
    </Card>
  ))}
</div>

            </>
          )}

          {/* No Results */}
          {!loading &&
            !error &&
            orders.length > 0 &&
            filteredOrders.length === 0 && (
              <Card className="p-12">
                <div className="text-center">
                  <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Orders Found
                  </h3>
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

      {/* Compact Mobile-First Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <Card className="w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col sm:rounded-xl rounded-t-xl">
            {/* Compact Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    #{selectedOrder.orderID?.slice(-3) || "000"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 p-0"
              >
                <XCircleIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Status Strip */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  selectedOrder.status.toLowerCase() === "completed"
                    ? "bg-green-50"
                    : selectedOrder.status.toLowerCase() === "pending"
                    ? "bg-yellow-50"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedOrder.status.toLowerCase() === "completed"
                        ? "bg-green-500"
                        : selectedOrder.status.toLowerCase() === "pending"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize">
                    {selectedOrder.status}
                  </span>
                </div>
                <DetailedDeliveryTimer
                  createdAt={selectedOrder.createdAt}
                  status={selectedOrder.status}
                />
              </div>

              {/* Compact Product Info */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={getProductImage(selectedOrder.productName)}
                      alt={selectedOrder.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {selectedOrder.productName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {selectedOrder.itemLabel}
                    </p>
                    <div className="flex items-center mt-1 space-x-2 text-xs">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        Qty: {selectedOrder.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ৳{selectedOrder.totalAmount}
                    </p>
                    <p className="text-xs text-gray-500">
                      ৳{selectedOrder.unitPrice} each
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Information Sections */}
              <div className="p-4 space-y-4">
                {/* Order Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Order Info
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formatDate(selectedOrder.createdAt, "date")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {selectedOrder.productType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Payment
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                        {selectedOrder.paymentAccountNumber}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                        {selectedOrder.transactionId}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Game Details (if applicable) */}
                {(selectedOrder.playerId || selectedOrder.zoneId) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Game Account
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {selectedOrder.playerId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Player ID:</span>
                          <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                            {selectedOrder.playerId}
                          </code>
                        </div>
                      )}
                      {selectedOrder.zoneId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zone ID:</span>
                          <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                            {selectedOrder.zoneId}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compact Receipt Section */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Receipt
                    </h4>
                  </div>
                  <ReceiptGenerator
                    order={selectedOrder}
                    userName={user?.name || "Guest User"}
                    userEmail={user?.email || "guest@example.com"}
                  />
                </div>
              </div>
            </div>

            {/* Compact Action Footer */}
            <div className="border-t bg-gray-50 p-3 sticky bottom-0 z-10">
              <div className="flex gap-2">
                {selectedOrder.status.toLowerCase() === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => {
                      alert("Contact support to cancel this order.");
                    }}
                  >
                    <PhoneIcon className="w-3 h-3 mr-1" />
                    Support
                  </Button>
                )}

                {selectedOrder.status.toLowerCase() === "completed" && (
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-9"
                    onClick={() => {
                      navigate(
                        `/${selectedOrder.productType
                          .toLowerCase()
                          .replace(" ", "-")}/${selectedOrder.productName
                          .toLowerCase()
                          .replace(" ", "-")}`
                      );
                      setSelectedOrder(null);
                    }}
                  >
                    Order Again
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
