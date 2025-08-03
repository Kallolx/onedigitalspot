import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { getUserOrders, getCurrentUser, OrderData } from "../lib/orders";
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
} from "lucide-react";
import { RotateLoader } from "react-spinners";

// Timer component for pending orders
const DeliveryTimer = ({ createdAt, status }: { createdAt: string; status: string }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [phase, setPhase] = useState<'initial' | 'extended' | 'overdue'>('initial');

  useEffect(() => {
    if (status.toLowerCase() !== 'pending') return;

    const calculateTimeLeft = () => {
      const orderTime = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - orderTime;
      
      // 30 minutes = 1800000ms, 2 hours = 7200000ms
      const thirtyMinutes = 30 * 60 * 1000;
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (elapsed < thirtyMinutes) {
        // First 30 minutes - show countdown to 30 minutes
        const remaining = thirtyMinutes - elapsed;
        setPhase('initial');
        setTimeLeft({
          minutes: Math.floor(remaining / 60000),
          seconds: Math.floor((remaining % 60000) / 1000)
        });
      } else if (elapsed < twoHours) {
        // 30 minutes to 2 hours - show countdown to 2 hours
        const remaining = twoHours - elapsed;
        setPhase('extended');
        setTimeLeft({
          minutes: Math.floor(remaining / 60000),
          seconds: Math.floor((remaining % 60000) / 1000)
        });
      } else {
        // Over 2 hours - show overdue
        setPhase('overdue');
        const overdue = elapsed - twoHours;
        setTimeLeft({
          minutes: Math.floor(overdue / 60000),
          seconds: Math.floor((overdue % 60000) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (status.toLowerCase() !== 'pending') {
    return null;
  }

  const getTimerColor = () => {
    switch (phase) {
      case 'initial':
        return 'text-green-600';
      case 'extended':
        return 'text-orange-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTimerText = () => {
    switch (phase) {
      case 'initial':
        return 'Delivery';
      case 'extended':
        return 'Processing';
      case 'overdue':
        return 'Delayed';
      default:
        return 'Processing';
    }
  };

  const formatTime = (minutes: number, seconds: number) => {
    const mins = minutes.toString().padStart(2, '0');
    const secs = seconds.toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm font-bold ${getTimerColor()}`}>
      <ClockIcon className="w-4 h-4" />
      <span className="text-xs">{getTimerText()}</span>
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
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [phase, setPhase] = useState<'initial' | 'extended' | 'overdue'>('initial');

    useEffect(() => {
      if (status.toLowerCase() !== 'pending') return;

      const calculateTimeLeft = () => {
        const orderTime = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const elapsed = now - orderTime;
        
        const thirtyMinutes = 30 * 60 * 1000;
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (elapsed < thirtyMinutes) {
          const remaining = thirtyMinutes - elapsed;
          setPhase('initial');
          setTimeLeft({
            hours: 0,
            minutes: Math.floor(remaining / 60000),
            seconds: Math.floor((remaining % 60000) / 1000)
          });
        } else if (elapsed < twoHours) {
          const remaining = twoHours - elapsed;
          setPhase('extended');
          setTimeLeft({
            hours: Math.floor(remaining / 3600000),
            minutes: Math.floor((remaining % 3600000) / 60000),
            seconds: Math.floor((remaining % 60000) / 1000)
          });
        } else {
          setPhase('overdue');
          const overdue = elapsed - twoHours;
          setTimeLeft({
            hours: Math.floor(overdue / 3600000),
            minutes: Math.floor((overdue % 3600000) / 60000),
            seconds: Math.floor((overdue % 60000) / 1000)
          });
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(interval);
    }, [createdAt, status]);

    if (status.toLowerCase() !== 'pending') {
      return (
        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit mt-2`}>
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </Badge>
      );
    }

    const getPhaseInfo = () => {
      switch (phase) {
        case 'initial':
          return {
            color: 'bg-green-100 text-green-800 border-green-200',
            text: 'Delivery',
            description: 'Processing within 30 minutes'
          };
        case 'extended':
          return {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            text: 'Processing',
            description: 'Delivery within 2 hours'
          };
        case 'overdue':
          return {
            color: 'bg-red-100 text-red-800 border-red-200',
            text: 'Delayed',
            description: 'Taking longer than expected'
          };
        default:
          return {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            text: 'Processing',
            description: 'Order being processed'
          };
      }
    };

    const phaseInfo = getPhaseInfo();
    const formatTime = (hours: number, minutes: number, seconds: number) => {
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="mt-3">
        <Badge className={`${phaseInfo.color} flex items-center gap-2 w-fit border px-4 py-2`}>
          <ClockIcon className="w-4 h-4" />
          <span className="font-medium text-sm">{phaseInfo.text}</span>
          <span className="font-mono font-black text-xl ml-1">
            {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
          </span>
        </Badge>
        <p className="text-xs text-gray-500 mt-2">{phaseInfo.description}</p>
      </div>
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
    if (order.status.toLowerCase() === 'pending') {
      return <DeliveryTimer createdAt={order.createdAt} status={order.status} />;
    }
    
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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col">
              <div>
                <h1 className="text-3xl md:text-4xl tracking-tighter font-bold text-gray-900 font-pixel">
                  My Orders
                </h1>
                <p className="text-gray-600 mt-2">
                  Track and manage all your orders in one place
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {!loading && !error && orders.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="p-6 bg-primary text-white shadow-retro border-2 border-primary-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold font-pixel">{summary.total}</p>
                  </div>
                  <PackageIcon className="w-10 h-10 text-primary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-secondary text-secondary-foreground shadow-retro border-2 border-secondary-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-foreground/90 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold font-pixel">{summary.pending}</p>
                  </div>
                  <ClockIcon className="w-10 h-10 text-secondary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-primary text-white shadow-retro border-2 border-primary-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold font-pixel">{summary.completed}</p>
                  </div>
                  <CheckCircleIcon className="w-10 h-10 text-primary-foreground/80" />
                </div>
              </Card>

              <Card className="p-6 bg-secondary text-secondary-foreground shadow-retro border-2 border-secondary-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-foreground/90 text-sm font-medium">Total Spent</p>
                    <p className="text-3xl font-bold font-pixel">{summary.totalAmount}৳</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search and Filter Bar */}
          {!loading && !error && orders.length > 0 && (
            <Card className="p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by product name, transaction ID, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </Card>
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
                                variant="outline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-pixel">Order Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircleIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 font-pixel">
                      {selectedOrder.productName}
                    </h3>
                    <p className="text-gray-600">
                      {selectedOrder.itemLabel} × {selectedOrder.quantity}
                    </p>
                    <DetailedDeliveryTimer createdAt={selectedOrder.createdAt} status={selectedOrder.status} />
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
                          <span className="text-primary font-pixel">{selectedOrder.totalAmount}৳</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedOrder.status.toLowerCase() === "pending" && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        alert("Contact support to cancel this order.");
                      }}
                    >
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
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
