import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  CreditCard,
  Shield,
  Clock,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import { createOrder, getCurrentUser, OrderData } from "@/lib/orders";
import OrderStatusModal from "@/components/custom/OrderStatusModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CheckoutItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
  label: string;
  price: number;
  productName: string;
  productImage: string;
  productType: string;
}

interface DeliveryInfo {
  method: string;
  email?: string;
  phone?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  deliveryInfo?: DeliveryInfo;
  gameInfo?: {
    playerId?: string;
    zoneId?: string;
    uuid?: string;
  };
  productDetails: {
    name: string;
    image: string;
    type: string;
  };
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get checkout data from navigation state or localStorage
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "bkash" | "nagad" | "Rocket" | null
  >(null);
  const [userAccount, setUserAccount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Delivery, 3: Payment
  const [orderModal, setOrderModal] = useState<{
    isOpen: boolean;
    status: "success" | "error";
    title?: string;
    message?: string;
    orderData?: any;
  }>({
    isOpen: false,
    status: "success",
  });

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

  // Load checkout data on component mount
  useEffect(() => {
    const data =
      location.state?.checkoutData || localStorage.getItem("checkoutData");
    if (data) {
      if (typeof data === "string") {
        setCheckoutData(JSON.parse(data));
        localStorage.removeItem("checkoutData");
      } else {
        setCheckoutData(data);
      }
    } else {
      // If no checkout data, redirect back
      navigate(-1);
    }
  }, [location.state, navigate]);

  // Initialize delivery info
  useEffect(() => {
    if (checkoutData?.deliveryInfo) {
      setDeliveryEmail(checkoutData.deliveryInfo.email || "");
      setDeliveryPhone(checkoutData.deliveryInfo.phone || "");
    }
  }, [checkoutData]);

  // Calculate total amount
  const totalAmount =
    checkoutData?.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0) || 0;

  // Update item quantity
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (!checkoutData) return;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      const updatedItems = checkoutData.items.filter((_, i) => i !== index);
      setCheckoutData({ ...checkoutData, items: updatedItems });
    } else {
      // Update quantity
      const updatedItems = checkoutData.items.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      );
      setCheckoutData({ ...checkoutData, items: updatedItems });
    }
  };

  // Remove item completely
  const removeItem = (index: number) => {
    if (!checkoutData) return;
    const updatedItems = checkoutData.items.filter((_, i) => i !== index);
    setCheckoutData({ ...checkoutData, items: updatedItems });
  };

  // Handle delivery method selection
  const handleDeliveryMethodSelect = (methodId: string) => {
    if (!checkoutData) return;

    const updatedDeliveryInfo = {
      method: methodId,
      email: methodId === "email" ? deliveryEmail : undefined,
      phone: methodId === "whatsapp" ? deliveryPhone : undefined,
    };

    setCheckoutData({
      ...checkoutData,
      deliveryInfo: updatedDeliveryInfo,
    });

    setShowDeliveryModal(true);
  };

  const confirmDeliveryDetails = () => {
    if (!checkoutData) return;

    const updatedDeliveryInfo = {
      ...checkoutData.deliveryInfo!,
      email:
        checkoutData.deliveryInfo?.method === "email"
          ? deliveryEmail
          : undefined,
      phone:
        checkoutData.deliveryInfo?.method === "whatsapp"
          ? deliveryPhone
          : undefined,
    };

    setCheckoutData({
      ...checkoutData,
      deliveryInfo: updatedDeliveryInfo,
    });

    setShowDeliveryModal(false);
    setIsEditingDelivery(false);
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Handle order completion
  const handleCompletePayment = async () => {
    if (
      !paymentMethod ||
      !userAccount ||
      !trxId ||
      !checkoutData ||
      checkoutData.items.length === 0
    ) {
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Missing Information",
        message: "Please fill in all payment details before proceeding.",
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      const user = await getCurrentUser();

      // Create orders for each item (settle all so we don't block on a single failure)
      const orderPromises = checkoutData.items.map(async (item) => {
        const orderData: Omit<
          OrderData,
          "id" | "orderID" | "createdAt" | "updatedAt"
        > = {
          userId: user.$id,
          userName: user.name || "Guest User",
          userEmail: user.email || "",
          productType: item.productType,
          productName: item.productName,
          productImage: item.productImage,
          itemLabel: item.label,
          quantity: item.quantity,
          unitPrice: item.price,
          totalAmount: item.price * item.quantity,
          playerId: checkoutData.gameInfo?.playerId || "",
          zoneId: checkoutData.gameInfo?.zoneId || "",
          paymentMethod: paymentMethod,
          paymentAccountNumber: userAccount,
          transactionId: trxId,
          status: "Pending",
          deliveryInfo: JSON.stringify(checkoutData.deliveryInfo),
        };

        return createOrder(orderData);
      });

      // Show modal as soon as the first order is created so the user gets quick feedback
      let firstShown = false;
      orderPromises.forEach((p) => {
        p.then((order) => {
          if (!firstShown && order) {
            firstShown = true;
            setOrderModal({
              isOpen: true,
              status: "success",
              title: "Order Received",
              message:
                "We've received your order and it's being processed. You will get a confirmation shortly.",
              orderData: {
                orderId: order.orderID,
                amount: totalAmount,
                productName: checkoutData.productDetails.name,
                transactionId: trxId,
              },
            });
          }
        }).catch(() => {
          // ignore individual failures here; final status will be determined after all settle
        });
      });

      // Use allSettled so a slow/failing document doesn't block the whole batch
      const results = await Promise.allSettled(orderPromises);
      const successfulOrders = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value)
        .filter(Boolean);

      const failedCount = results.filter((r) => r.status === "rejected").length;

      if (successfulOrders.length > 0) {
        setOrderModal({
          isOpen: true,
          status: "success",
          title: "Orders Placed Successfully!",
          message: `Your ${successfulOrders.length} order(s) have been placed and are being processed.${
            failedCount > 0 ? ` ${failedCount} order(s) failed. We'll notify you.` : ""
          } You will receive updates via ${
            checkoutData.deliveryInfo?.method === "email" ? "email" : "WhatsApp"
          }.`,
          orderData: {
            orderId: successfulOrders[0].orderID,
            amount: totalAmount,
            productName: checkoutData.productDetails.name,
            transactionId: trxId,
          },
        });

        // Don't clear checkoutData immediately — keep it until the user closes the modal
        // to avoid showing the loading placeholder underneath the modal.
      } else {
        throw new Error("Failed to create any orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Order Failed",
        message:
          "Failed to create order. Please check your details and try again.",
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Payment methods configuration
  const paymentMethods = [
    {
      id: "bkash" as const,
      name: "bKash",
      icon: "/assets/icons/bKash.svg",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-gradient-to-r from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      account: "01831624571",
      type: "Send Money",
      qr: "/assets/qr/bkash.png",
      description: "Most popular mobile banking in Bangladesh",
      instructions: [
        'Open up the bKash app & Choose "Send Money" Its a Personal Account',
        'Enter the bKash Account Number: <span class="font-bold text-pink-600">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-pink-600\">${toBanglaNumber(
          totalAmount
        )}৳</span>`,
        "Confirm the Transaction",
        "After sending money, you'll receive a bKash Transaction ID (TRX ID)",
      ],
    },
    {
      id: "nagad" as const,
      name: "Nagad",
      icon: "/assets/icons/nagad.svg",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-r from-orange-50 to-red-100",
      borderColor: "border-orange-200",
      account: "01831624571",
      type: "Send Money",
      description: "Digital financial service by Bangladesh Post Office",
      instructions: [
        'Open up the Nagad app & Choose "Send Money"',
        'Enter the Nagad Account Number: <span class="font-bold text-orange-600">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-orange-600\">${toBanglaNumber(
          totalAmount
        )}৳</span>`,
        "Confirm the Transaction",
        "After sending money, you'll receive a Nagad Transaction ID",
      ],
    },
    {
      id: "Rocket" as const,
      name: "Rocket",
      icon: "/assets/icons/rocket.png",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-purple-100",
      borderColor: "border-blue-200",
      account: "01831624571",
      type: "Send Money",
      description: "Mobile financial service by Dutch-Bangla Bank",
      instructions: [
        'Open up the Rocket app & Choose "Send Money"',
        'Enter the Rocket Account Number: <span class="font-bold text-blue-600">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-blue-600\">${toBanglaNumber(
          totalAmount
        )}৳</span>`,
        "Confirm the Transaction",
        "After sending money, you'll receive a Rocket Transaction ID",
      ],
    },
  ];

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            Loading checkout...
          </h1>
          <p className="text-gray-600">
            Please wait while we prepare your order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="font-pixel"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold font-pixel text-foreground">
                Checkout
              </h1>
              <p className="text-gray-600 mt-1">
                Review your order and complete payment
              </p>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile Summary Modal */}
        <div className="md:hidden">
          <Dialog open={showMobileSummary} onOpenChange={setShowMobileSummary}>
            <DialogContent className="max-w-sm bg-background w-full mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  Order Summary
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-anekbangla font-semibold">
                      ৳{toBanglaNumber(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="font-anekbangla text-xl font-bold text-primary">
                        ৳{toBanglaNumber(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className={`w-full h-12 font-semibold ${
                    userAccount &&
                    trxId &&
                    !isProcessingOrder &&
                    checkoutData.deliveryInfo &&
                    paymentMethod
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={
                    !userAccount ||
                    !trxId ||
                    isProcessingOrder ||
                    !checkoutData.deliveryInfo ||
                    !paymentMethod
                  }
                  onClick={handleCompletePayment}
                >
                  {isProcessingOrder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Complete Payment
                    </div>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Products & Payment Methods */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Summary Card */}
            <Card className="shadow-sm border bg-white">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={checkoutData.productDetails.image}
                    alt={checkoutData.productDetails.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {checkoutData.productDetails.name}
                    </h2>
                    <p className="text-gray-600">
                      {checkoutData.productDetails.type}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {checkoutData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.label}
                        </h4>
                        <p className="text-sm text-gray-600 font-anekbangla">
                          ৳{toBanglaNumber(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-white border rounded-lg">
                          <button
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded-l-lg"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-2 text-sm font-medium min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-2 hover:bg-gray-100 rounded-r-lg"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-primary font-anekbangla">
                          ৳{toBanglaNumber(item.price * item.quantity)}
                        </span>

                        <button
                          type="button"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Method - Display Only */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Selected Delivery Method
                  </h3>
                  {checkoutData.deliveryInfo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">
                          {checkoutData.deliveryInfo.method === "email"
                            ? "Email"
                            : "WhatsApp"}{" "}
                          delivery
                        </span>
                      </div>
                      {checkoutData.deliveryInfo.email && (
                        <p className="text-green-700 text-sm mt-1">
                          {checkoutData.deliveryInfo.email}
                        </p>
                      )}
                      {checkoutData.deliveryInfo.phone && (
                        <p className="text-green-700 text-sm mt-1">
                          {checkoutData.deliveryInfo.phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        To change delivery method, please go back to the product
                        page.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        No delivery method selected. Please go back to select
                        one.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Card */}
            <Card className="shadow-sm border bg-white">
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        paymentMethod === method.id
                          ? `${method.borderColor} ${method.bgColor} shadow-lg`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-8 h-8 mx-auto mb-2"
                      />
                      <p className="text-xs font-medium text-center">
                        {method.name}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Payment Details */}
                {paymentMethod && (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => {
                      if (method.id !== paymentMethod) return null;

                      return (
                        <div key={method.id} className="space-y-4">
                          {/* Account Info */}
                          <div
                            className={`${method.bgColor} rounded-lg p-4 border ${method.borderColor}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={method.icon}
                                alt={method.name}
                                className="w-6 h-6"
                              />
                              <div>
                                <h5 className="font-semibold">{method.name}</h5>
                                <p className="text-xs text-gray-600">
                                  {method.description}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white/80 rounded-lg p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Number:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {method.account}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(method.account, "account")
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {copiedText === "account" ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Amount:
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-anekbangla text-primary">
                                    ৳{toBanglaNumber(totalAmount)}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        totalAmount.toString(),
                                        "amount"
                                      )
                                    }
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {copiedText === "amount" ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Form */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your {method.name} Number *
                              </label>
                              <Input
                                placeholder={`Enter your ${method.name} number`}
                                value={userAccount}
                                onChange={(e) => setUserAccount(e.target.value)}
                                className="h-12"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transaction ID *
                              </label>
                              <Input
                                placeholder="Enter transaction ID (TRX ID)"
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                                className="h-12"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <Card className="shadow-lg border bg-white">
                <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-4 lg:p-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order Summary
                  </h3>
                </div>

                <CardContent className="p-4 lg:p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-anekbangla font-semibold">
                        ৳{toBanglaNumber(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="font-anekbangla text-2xl font-bold text-primary">
                          ৳{toBanglaNumber(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className={`w-full h-12 font-semibold ${
                      userAccount &&
                      trxId &&
                      !isProcessingOrder &&
                      checkoutData.deliveryInfo &&
                      paymentMethod
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={
                      !userAccount ||
                      !trxId ||
                      isProcessingOrder ||
                      !checkoutData.deliveryInfo ||
                      !paymentMethod
                    }
                    onClick={handleCompletePayment}
                  >
                    {isProcessingOrder ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Complete Payment
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>


      </div>

      {/* Delivery Confirmation Modal */}
      <Dialog
        open={showDeliveryModal}
        onOpenChange={(open) => {
          setShowDeliveryModal(open);
          if (!open) setIsEditingDelivery(false);
        }}
      >
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground mb-2 text-center">
              Confirm{" "}
              {checkoutData.deliveryInfo?.method === "email"
                ? "Email"
                : "WhatsApp"}{" "}
              Delivery
            </DialogTitle>
          </DialogHeader>

          {checkoutData.deliveryInfo?.method === "email" ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send your order details and activation codes to this email
                address:
              </p>
              <div className="space-y-3">
                {isEditingDelivery ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                      className="h-12"
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsEditingDelivery(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          confirmDeliveryDetails();
                          setIsEditingDelivery(false);
                        }}
                        disabled={!deliveryEmail}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="font-medium text-gray-900 text-center">
                        {deliveryEmail || "Please enter your email"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1 h-12"
                        onClick={confirmDeliveryDetails}
                        disabled={!deliveryEmail}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Confirm Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12"
                        onClick={() => setIsEditingDelivery(true)}
                      >
                        {deliveryEmail ? "Change" : "Add"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send your order details and activation codes to this
                WhatsApp number:
              </p>
              <div className="space-y-3">
                {isEditingDelivery ? (
                  <div className="space-y-3">
                    <Input
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="h-12"
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsEditingDelivery(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          confirmDeliveryDetails();
                          setIsEditingDelivery(false);
                        }}
                        disabled={!deliveryPhone}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="font-medium text-gray-900 text-center">
                        {deliveryPhone || "Please enter your phone number"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1 h-12"
                        onClick={confirmDeliveryDetails}
                        disabled={!deliveryPhone}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Confirm WhatsApp
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12"
                        onClick={() => setIsEditingDelivery(true)}
                      >
                        {deliveryPhone ? "Change" : "Add"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Status Modal */}
      <OrderStatusModal
        isOpen={orderModal.isOpen}
        onClose={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          // clear checkout data when modal is dismissed
          setCheckoutData(null);
          setPaymentMethod(null);
          setUserAccount("");
          setTrxId("");
        }}
        status={orderModal.status}
        title={orderModal.title}
        message={orderModal.message}
        orderData={orderModal.orderData}
        onViewOrders={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          setCheckoutData(null);
          navigate("/my-orders");
        }}
        onRetry={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          // allow user to retry without losing delivery selection
          setPaymentMethod(null);
          setUserAccount("");
          setTrxId("");
        }}
      />
    </div>
  );
};

export default Checkout;
