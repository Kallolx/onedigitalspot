import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import ReviewModal from "../components/custom/ReviewModal";
import { getUserReviews } from "../lib/reviews";
import { account } from "../lib/appwrite";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  SearchIcon,
  EyeIcon,
  PackageIcon,
  Coins,
  X,
} from "lucide-react";
import { RotateLoader } from "react-spinners";
import { Copy01Icon, Message01Icon } from "hugeicons-react";
import { useToast } from "../hooks/use-toast";
import Footer from "@/components/landing/Footer";
import CompactStat from "../components/ui/compact-stat";

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

  const name = (productName || "").toString().trim().toLowerCase();

  // Try exact match, then fuzzy includes (both directions)
  const product = allProducts.find((p) => {
    const title = p.title.toLowerCase();
    return title === name || title.includes(name) || name.includes(title);
  });

  if (!product) {
    // Helpful dev-time warning when an order's productName isn't mapped
    if (name) console.warn(`[MyOrders] no product mapping found for "${name}"`);
  }

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

  // Utility to convert English digits to Bangla digits
  const toBanglaNumber = (num: string | number) => {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    const formatted = Number(num).toLocaleString("en-IN");
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  };

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
      <span className="font-sans text-lg font-bold text-secondary">
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
  const [reviewOrder, setReviewOrder] = useState<OrderData | null>(null);
  const [completedOrdersToReview, setCompletedOrdersToReview] = useState<
    OrderData[]
  >([]);
  const [orderReviewStatus, setOrderReviewStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [page, setPage] = useState(1);

  // Check review status for completed orders
  const checkOrderReviewStatus = async () => {
    try {
      const currentUser = await account.get();
      if (currentUser) {
        const userReviews = await getUserReviews(currentUser.$id);
        const reviewStatus: { [key: string]: boolean } = {};

        completedOrdersToReview.forEach((order) => {
          const hasReviewed = userReviews.some(
            (review: any) => review.productName === order.productName
          );
          reviewStatus[order.$id || order.id || ""] = hasReviewed;
        });

        setOrderReviewStatus(reviewStatus);
      }
    } catch (error) {
      console.error("Error checking review status:", error);
    }
  };
  const [pageSize, setPageSize] = useState(10);
  const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(
    () => {
      try {
        const raw = localStorage.getItem("processedOrderIds");
        if (raw) {
          const arr = JSON.parse(raw) as string[];
          return new Set(arr.filter(Boolean));
        }
      } catch (e) {
        // ignore
      }
      return new Set();
    }
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  const receiptRef = useRef<{ download: () => Promise<void> } | null>(null);
  // local copied state for inline label
  const [copied, setCopied] = useState(false);

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
          <span className="capitalize">{status}</span>
        </Badge>
      );
    }

    // If pending but over 30 minutes, show processing badge
    if (!showTimer) {
      return (
        <Badge className="text-[hsl(var(--retro-yellow))] border-[hsl(var(--retro-yellow))] flex items-center gap-1 w-fit mt-2">
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

  // Handle review submission from ReviewModal
  const handleReviewSubmitted = () => {
    // Remove the current order from the review queue
    if (reviewOrder) {
      setCompletedOrdersToReview((prev) =>
        prev.filter(
          (order) =>
            (order.$id || order.id) !== (reviewOrder.$id || reviewOrder.id)
        )
      );
    }

    // Close the review modal
    setReviewOrder(null);

    // Refresh review status
    checkOrderReviewStatus();

    // Show next review modal if there are more
    if (completedOrdersToReview.length > 1) {
      const nextOrder = completedOrdersToReview.find(
        (order) =>
          (order.$id || order.id) !== (reviewOrder?.$id || reviewOrder?.id)
      );
      if (nextOrder) {
        setTimeout(() => setReviewOrder(nextOrder), 500);
      }
    }
  };

  // Check for completed orders that need reviews
  useEffect(() => {
    if (orders.length > 0) {
      const completedOrders = orders.filter(
        (order) =>
          order.status.toLowerCase() === "completed" &&
          !processedOrderIds.has(order.$id || order.id || "")
      );

      if (completedOrders.length > 0) {
        setCompletedOrdersToReview(completedOrders);
        setReviewOrder(completedOrders[0]);

        // Mark these orders as processed so modal doesn't show again (persisted)
        setProcessedOrderIds((prev) => {
          const newSet = new Set(prev);
          completedOrders.forEach((order) => {
            const id = order.$id || order.id || "";
            if (id) newSet.add(id);
          });
          try {
            localStorage.setItem(
              "processedOrderIds",
              JSON.stringify(Array.from(newSet))
            );
          } catch (e) {
            // ignore storage errors
          }
          return newSet;
        });

        // Check review status for these orders
        checkOrderReviewStatus();
      }
    }
  }, [orders, processedOrderIds]);

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
        return "text-[hsl(var(--retro-yellow))] border-[hsl(var(--retro-yellow))]";
      case "confirmed":
        return "bg-[hsl(var(--retro-blue))]/20 text-[hsl(var(--retro-blue))] border-[hsl(var(--retro-blue))]";
      case "completed":
        return "bg-[hsl(var(--retro-mint))] text-foreground border-[hsl(var(--retro-mint))]";
      case "cancelled":
        return "bg-[hsl(var(--destructive))] text-foreground border-[hsl(var(--destructive))]";
      case "processing":
        return "text-[hsl(var(--retro-yellow))] border-[hsl(var(--retro-yellow))]";
      default:
        return "bg-muted text-muted-foreground border-border";
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
          <Badge className="bg-retro-yellow/20 text-foreground border-[hsl(var(--retro-yellow))] flex items-center gap-1 w-fit">
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

  // Pagination for desktop table
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Ensure current page is valid when filters/pageSize change
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredOrders.length, pageSize, totalPages]);

  function toBanglaNumber(totalAmount: number): import("react").ReactNode {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    // format with grouping to match other usages (e.g., 1,234)
    const formatted = Number(totalAmount).toLocaleString("en-IN");
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // normalize selected order status to avoid casing/whitespace issues
  const selectedStatus = selectedOrder?.status?.toLowerCase().trim() ?? "";

  return (
    <div className="bg-gray-50 min-h-screen">
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
              <div className="flex flex-row gap-2 items-end w-full md:w-auto md:max-w-2xl">
                <div className="relative flex-1 md:min-w-[320px]">
                  <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 text-base border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
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

          {/* Summary Cards - desktop grid and compact mobile row */}
          <div className="mb-8">
            {/* Desktop / larger screens */}
            <div className="hidden lg:grid grid-cols-4 gap-4 md:gap-6">
              {/* Total Orders */}
              <Card className="flex items-center p-3 sm:p-4 bg-background rounded-2xl justify-center sm:justify-start">
                <div className="p-3 sm:p-4 items-center justify-center hidden sm:flex">
                  <PackageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
                </div>
                <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                  <p className="text-sm font-medium text-foreground/70">
                    Total Orders
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-pixel text-foreground">
                    {summary.total}
                  </p>
                </div>
              </Card>

              {/* Pending */}
              <Card className="flex items-center p-3 sm:p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
                <div className="p-3 sm:p-4 items-center justify-center hidden sm:flex">
                  <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
                </div>
                <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                  <p className="text-sm font-medium text-foreground/70">
                    Pending
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-pixel text-foreground">
                    {summary.pending}
                  </p>
                </div>
              </Card>

              {/* Completed */}
              <Card className="flex items-center p-3 sm:p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
                <div className="p-3 sm:p-4 items-center justify-center hidden sm:flex">
                  <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
                </div>
                <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                  <p className="text-sm font-medium text-foreground/70">
                    Completed
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-pixel text-foreground">
                    {summary.completed}
                  </p>
                </div>
              </Card>

              {/* Total Spent */}
              <Card className="flex items-center p-3 sm:p-4 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg justify-center sm:justify-start">
                <div className="p-3 sm:p-4 bg-yellow-500/20 rounded-full items-center justify-center hidden sm:flex">
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                </div>
                <div className="ml-0 sm:ml-4 flex flex-col text-center sm:text-left">
                  <p className="text-sm font-medium text-foreground/70">
                    Total Spent
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-anekbangla text-secondary">
                    {toBanglaNumber(summary.totalAmount)}৳
                  </p>
                </div>
              </Card>
            </div>

            {/* Compact row for mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-3">
              <CompactStat
                title="Orders"
                value={summary.total}
                icon={<PackageIcon className="w-5 h-5" />}
              />
              <CompactStat
                title="Pending"
                value={summary.pending}
                icon={<ClockIcon className="w-5 h-5" />}
              />
              <CompactStat
                title="Completed"
                value={summary.completed}
                icon={<CheckCircleIcon className="w-5 h-5" />}
              />
              <CompactStat
                title="Spent"
                value={<span className="text-secondary">{toBanglaNumber(summary.totalAmount)}৳</span>}
                icon={<Coins className="w-5 h-5 text-yellow-400" />}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="p-12 bg-background rounded-2xl">
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
            <Card className="p-12 bg-background">
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
              <Card className="hidden lg:block overflow-hidden bg-background rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">
                          Order ID
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
                      {paginatedOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Order Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={
                                    order.productImage ||
                                    getProductImage(order.productName)
                                  }
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
                              </div>
                            </div>
                          </td>

                          {/* Order ID (with copy) */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-md  font-semibold text-secondary truncate">
                                  {order.orderID || "N/A"}
                                </p>
                              </div>

                              <div className="ml-4 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const text = order.orderID || "";
                                    try {
                                      if (
                                        navigator.clipboard &&
                                        navigator.clipboard.writeText
                                      ) {
                                        await navigator.clipboard.writeText(
                                          text
                                        );
                                      } else {
                                        const ta =
                                          document.createElement("textarea");
                                        ta.value = text;
                                        document.body.appendChild(ta);
                                        ta.select();
                                        document.execCommand("copy");
                                        document.body.removeChild(ta);
                                      }
                                      toast({
                                        title: "Order ID copied to clipboard.",
                                      });
                                    } catch (err) {
                                      console.error("Copy failed", err);
                                      toast({
                                        title: "Copy failed",
                                        description: "Unable to copy order ID.",
                                      });
                                    }
                                  }}
                                  className="p-2 rounded-md hover:bg-gray-100"
                                  aria-label="Copy order ID"
                                >
                                  <Copy01Icon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4">
                            <p className="text-foreground font-medium">
                              {order.paymentMethod}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              TRX: {order.transactionId}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {getStatusDisplay(order)}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <p className="text-secondary font-bold font-anekbangla text-lg">
                              {toBanglaNumber(order.totalAmount)}৳
                            </p>
                            <p className="text-muted-foreground font-bold font-anekbangla text-xs">
                              {toBanglaNumber(order.unitPrice)}৳ × {order.quantity}
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
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      navigate(
                                        `/${order.productType
                                          .toLowerCase()
                                          .replace(
                                            " ",
                                            "-"
                                          )}/${order.productName
                                          .toLowerCase()
                                          .replace(" ", "-")}`
                                      )
                                    }
                                  >
                                    Reorder
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination Footer for Desktop Table */}
              <div className="hidden lg:flex flex-col md:flex-row md:items-center md:justify-between bg-background gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-sm text-gray-600">
                    Showing {(page - 1) * pageSize + 1}-
                    {Math.min(page * pageSize, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
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
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="font-pixel text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Orders Cards - Mobile */}
              <div className="lg:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="p-4 bg-background rounded-2xl"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={
                            order.productImage ||
                            getProductImage(order.productName)
                          }
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
                        <p className="text-secondary text-lg font-anekbangla font-bold">
                          {toBanglaNumber(order.totalAmount)}৳
                        </p>

                        <p className="text-foreground font-medium mt-2">Date</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDate(order.createdAt, "date")}
                        </p>
                      </div>

                      {/* Right Column */}
                      <div className="pl-3">
                        <p className="text-foreground font-medium">Payment</p>
                        <p className="text-secondary text-lg font-anekbangla font-bold">{order.paymentMethod}</p>

                        <p className="text-gray-500 font-medium mt-2">
                          Product
                        </p>
                        <p className="text-gray-900">{order.productName}</p>
                      </div>
                    </div>

                    {/* Game Details / Player ID */}
                    {(order.playerId || order.zoneId || order.uuid) && (
                      <div className="mt-3 text-sm text-gray-700">
                        {order.playerId && (
                          <p>
                            <span className="font-medium">Player ID:</span>{" "}
                            {order.playerId}
                          </p>
                        )}
                        {order.zoneId && (
                          <p>
                            <span className="font-medium">Zone ID:</span>{" "}
                            {order.zoneId}
                          </p>
                        )}
                        {order.uuid && (
                          <p>
                            <span className="font-medium">UID:</span>{" "}
                            {order.uuid}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col sm:rounded-xl rounded-lg">
            {/* Compact Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <div className="items-center">
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
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Status Strip - single status on left, order id (copy) on right */}
              <div
                className={`border-b flex items-center justify-between text-foreground ${
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
                  <span className="text-sm font-medium capitalize text-secondary">
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-anekbangla text-gray-600 flex items-center gap-3">
                      <span>অর্ডার নম্বর :</span>
                      <span className="font-bold font-mono text-secondary">
                        {selectedOrder.orderID}
                      </span>
                      {copied && (
                        <span className="text-sm text-green-600">Copied</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const text = selectedOrder.orderID || "";
                        try {
                          if (
                            navigator.clipboard &&
                            navigator.clipboard.writeText
                          ) {
                            await navigator.clipboard.writeText(text);
                          } else {
                            const ta = document.createElement("textarea");
                            ta.value = text;
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand("copy");
                            document.body.removeChild(ta);
                          }
                          setCopied(true);
                          toast({ title: "Order ID copied to clipboard." });
                          setTimeout(() => setCopied(false), 1500);
                        } catch (err) {
                          console.error("Copy failed", err);
                          toast({
                            title: "Copy failed",
                            description: "Unable to copy order ID.",
                          });
                        }
                      }}
                      className="text-xs text-foreground/80 hover:text-foreground p-2 rounded-full"
                      aria-label="Copy order ID"
                    >
                      <Copy01Icon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Product Info */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={
                        selectedOrder.productImage ||
                        getProductImage(selectedOrder.productName)
                      }
                      alt={selectedOrder.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-md truncate">
                      {selectedOrder.productName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {selectedOrder.itemLabel}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-xl font-bold font-anekbangla text-secondary">
                      ৳{toBanglaNumber(selectedOrder.totalAmount)} টাকা
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const r = receiptRef.current;
                          if (r && typeof r.download === "function") {
                            await r.download();
                          } else {
                            const btn = document.querySelector(
                              'button[title="Download Receipt"]'
                            ) as HTMLButtonElement | null;
                            if (btn) btn.click();
                          }
                        } catch (err) {
                          console.error("Receipt download failed", err);
                          toast({
                            title: "Download failed",
                            description: "Could not download receipt.",
                          });
                        }
                      }}
                      className="h-8 w-8 flex items-center justify-center rounded-full border border-transparent hover:bg-gray-100"
                      aria-label="Download receipt"
                      title="Download Receipt"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 3v12m0 0l4-4m-4 4l-4-4M21 21H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Information Sections */}
              <div className="p-4 space-y-6">
                {/* Order Info */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">
                    Order Info
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className=" text-foreground">Date:</span>
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
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Payment
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground">Method:</span>
                      <span className="font-medium text-md">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground">Account:</span>
                      <code className="text-md bg-secondary text-primary font-bold px-1 rounded">
                        {selectedOrder.paymentAccountNumber}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction:</span>
                      <code className="text-md bg-secondary text-primary font-bold px-1 rounded">
                        {selectedOrder.transactionId}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Game Details (if applicable) */}
                {(selectedOrder.playerId ||
                  selectedOrder.zoneId ||
                  selectedOrder.uuid) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Game Account
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      {selectedOrder.playerId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Player ID:</span>
                          <code className="text-md bg-secondary text-primary font-bold px-1 rounded">
                            {selectedOrder.playerId}
                          </code>
                        </div>
                      )}
                      {selectedOrder.zoneId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zone ID:</span>
                          <code className="text-md bg-secondary text-primary font-bold px-1 rounded">
                            {selectedOrder.zoneId}
                          </code>
                        </div>
                      )}
                      {selectedOrder.uuid && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">UID:</span>
                          <code className="text-md bg-secondary text-primary font-bold px-1 rounded">
                            {selectedOrder.uuid}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message us for statuses other than 'confirmed' or 'completed' */}
                {!(
                  selectedOrder.status.toLowerCase() === "confirmed" ||
                  selectedOrder.status.toLowerCase() === "completed"
                ) && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      className="w-full text-md justify-center"
                      aria-label="Message us on WhatsApp"
                      onClick={() => {
                        const phone = "8801831624571";
                        const orderId = selectedOrder.orderID || "";
                        const productName = selectedOrder.productName || "";
                        const message = encodeURIComponent(
                          `Hello, I need help with my order.\nOrder ID: ${orderId}\nProduct: ${productName}`
                        );
                        window.open(
                          `https://wa.me/${phone}?text=${message}`,
                          "_blank"
                        );
                      }}
                    >
                      <Message01Icon className="w-6 h-6" />
                      Message us on WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Action Footer (only when completed: Review + Order Again) */}
            {selectedOrder.status.toLowerCase() === "completed" && (
              <div className="border-t bg-gray-50 p-3 sticky bottom-0 z-10">
                <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs h-9"
                      onClick={() => setReviewOrder(selectedOrder)}
                    >
                      {orderReviewStatus[
                        selectedOrder.$id || selectedOrder.id || ""
                      ]
                        ? "Edit Review"
                        : "Write Review"}
                    </Button>

                    <Button
                      variant="ghost"
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
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          isOpen={true}
          onClose={() => {
            setReviewOrder(null);
            // If there are more reviews in queue, show next one
            const remainingReviews = completedOrdersToReview.filter(
              (order) =>
                (order.$id || order.id) !== (reviewOrder.$id || reviewOrder.id)
            );
            if (remainingReviews.length > 0) {
              setTimeout(() => setReviewOrder(remainingReviews[0]), 500);
            }
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;
