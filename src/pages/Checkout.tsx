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
import { account } from "@/lib/appwrite";
import { useCart } from "@/contexts/CartContext";
import OrderStatusModal from "@/components/custom/OrderStatusModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReloadIcon } from "hugeicons-react";
import Footer from "@/components/landing/Footer";

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
  isCartCheckout?: boolean; // Flag to indicate if checkout came from cart
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get checkout data from navigation state or localStorage
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isCartCheckout, setIsCartCheckout] = useState(false); // Track if checkout came from cart
  const { items: cartItems, clear: clearCart, setOpen: setCartOpen } = useCart();
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

  
  // Delivery method selection states (moved from GameDetailsLayout)
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string | null>(null);
  const [showDeliverySelectionModal, setShowDeliverySelectionModal] = useState(false);
  const [availableDeliveryMethods, setAvailableDeliveryMethods] = useState<any[]>([
    { id: "email", name: "Email", icon: "email", active: true },
    { id: "whatsapp", name: "WhatsApp", icon: "whatsapp", active: true },
  ]);
  const [countryCode, setCountryCode] = useState("+88");
  const [phoneLocal, setPhoneLocal] = useState("");
  
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
    // Always prefer navigation state over everything else (direct product checkout)
    const navData = (location.state as any)?.checkoutData;
    
    if (navData) {
      setCheckoutData(navData);
      setIsCartCheckout(navData.isCartCheckout || false);
      return;
    }
    
    // Second priority: saved localStorage value
    const saved = localStorage.getItem("checkoutData");
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setCheckoutData(parsedData);
        setIsCartCheckout(parsedData.isCartCheckout || false);
        localStorage.removeItem("checkoutData");
        return;
      } catch (e) {
        console.warn("Failed to parse saved checkout data:", e);
      }
    }
  }, [location.state]); // Only depend on location.state to avoid cart interference

  // Separate effect for cart fallback - only runs if no navigation data
  useEffect(() => {
    const navData = (location.state as any)?.checkoutData;
    const saved = localStorage.getItem("checkoutData");
    
    // Only use cart as fallback if no other data source is available
    if (!navData && !saved && !checkoutData && cartItems && cartItems.length > 0) {
      const checkoutItems: CheckoutItem[] = cartItems.map((ci) => ({
        categoryIdx: 0,
        itemIdx: 0,
        quantity: ci.quantity,
        label: ci.label || ci.productName,
        price: ci.price,
        productName: ci.productName,
        productImage: ci.productImage || "",
        productType: ci.productType || "Products",
      }));

      // Extract game info from cart items (prioritize complete game info)
      const gameInfoItems = cartItems.filter(item => 
        item.gameInfo && 
        (item.gameInfo.playerId || item.gameInfo.zoneId || item.gameInfo.uuid)
      );
      
      // Use the most complete game info available
      const gameInfo = gameInfoItems.length > 0 
        ? gameInfoItems.find(item => 
            item.gameInfo?.playerId && 
            item.gameInfo?.zoneId
          )?.gameInfo || gameInfoItems[0]?.gameInfo
        : undefined;

      setCheckoutData({
        items: checkoutItems,
        gameInfo: gameInfo, // Include game information from cart
        productDetails: {
          name: checkoutItems.length === 1 ? checkoutItems[0].productName : "Cart",
          image: checkoutItems[0]?.productImage || "/assets/placeholder.svg",
          type: checkoutItems[0]?.productType || "Products",
        },
      });
      setIsCartCheckout(true); // Mark this as cart checkout
    }
  }, [cartItems, checkoutData, location.state]);

  // Add a fallback check to redirect only if we truly have no data after initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      // After 1 second, if we still have no checkout data and no navigation state,
      // then redirect the user back
      const navData = (location.state as any)?.checkoutData;
      const saved = localStorage.getItem("checkoutData");
      
      if (!checkoutData && !navData && !saved && (!cartItems || cartItems.length === 0)) {
        navigate(-1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkoutData, location.state, cartItems, navigate]);

  // Initialize delivery info
  useEffect(() => {
    if (checkoutData?.deliveryInfo) {
      setDeliveryEmail(checkoutData.deliveryInfo.email || "");
      setDeliveryPhone(checkoutData.deliveryInfo.phone || "");
      setSelectedDeliveryMethod(checkoutData.deliveryInfo.method || null);
    }
  }, [checkoutData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Handle delivery method selection from existing modal
  const handleDeliveryMethodConfirm = (methodId: string) => {
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

  // Handle delivery method selection (moved from GameDetailsLayout)
  const handleDeliveryMethodSelect = async (methodId: string) => {
    const user = await getCurrentUser();

    if (methodId === "email") {
      setDeliveryEmail(user.email || "");
      setSelectedDeliveryMethod(methodId);
      setShowDeliverySelectionModal(true);
    } else if (methodId === "whatsapp") {
      // Read phone from account prefs (Appwrite account) or fallback to user.phone
      try {
        const full = (user?.prefs && user.prefs.phone) || user.phone || "";
        // Parse into country code and local part for the UI
        if (full && full.startsWith("+")) {
          const match = full.match(/^\+(\d{1,3})(\d*)$/);
          if (match) {
            setCountryCode("+" + match[1]);
            setPhoneLocal(match[2] || "");
          } else {
            setCountryCode("+88");
            setPhoneLocal(full.replace(/[^0-9]/g, ""));
          }
        } else if (full && full.startsWith("00")) {
          // convert 00xxxx to +xxxx
          const converted = "+" + full.slice(2).replace(/[^0-9]/g, "");
          const match = converted.match(/^\+(\d{1,3})(\d*)$/);
          if (match) {
            setCountryCode("+" + match[1]);
            setPhoneLocal(match[2] || "");
          } else {
            setCountryCode("+88");
            setPhoneLocal(converted.replace(/[^0-9]/g, ""));
          }
        } else {
          // assume local BD number if plain digits
          setCountryCode("+88");
          setPhoneLocal(full.replace(/[^0-9]/g, ""));
        }
        setDeliveryPhone(full);
      } catch (error) {
        setDeliveryPhone("");
      }
      setSelectedDeliveryMethod(methodId);
      setShowDeliverySelectionModal(true);
    } else {
      // For other delivery methods, just select them directly for now
      setSelectedDeliveryMethod(methodId);
    }
  };

  // Confirm delivery details (moved from GameDetailsLayout)
  const confirmDeliveryDetailsFromSelection = async () => {
    if (selectedDeliveryMethod === "whatsapp" && deliveryPhone) {
      // Save phone number exactly as user entered it for WhatsApp messaging
      try {
        const user = await getCurrentUser();
        // Save the phone exactly as entered - no normalization
        setDeliveryPhone(deliveryPhone);
        const prefs = { ...(user?.prefs || {}), phone: deliveryPhone };
        await (account as any).updatePrefs(prefs);
      } catch (error) {
        console.warn("Could not save phone number to account prefs:", error);
      }
    }

    // Update checkoutData with selected delivery method
    if (checkoutData && selectedDeliveryMethod) {
      const updatedDeliveryInfo = {
        method: selectedDeliveryMethod,
        email: selectedDeliveryMethod === "email" ? deliveryEmail : undefined,
        phone: selectedDeliveryMethod === "whatsapp" ? deliveryPhone : undefined,
      };

      setCheckoutData({
        ...checkoutData,
        deliveryInfo: updatedDeliveryInfo,
      });
    }

    setShowDeliverySelectionModal(false);
    setIsEditingDelivery(false);
  };

  // Allow user to reselect product/delivery: preserve checkoutData and navigate back
  const handleReselect = () => {
    if (!checkoutData) return;
    try {
      // store current checkout data so the previous page can restore it
      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    } catch (e) {
      console.error("Failed to save checkoutData for reselect:", e);
    }

    // If navigation origin was provided, go there with state; otherwise go back
    const origin = (location.state as any)?.from as string | undefined;
    if (origin) {
      navigate(origin, { state: { checkoutData } });
    } else {
      navigate(-1);
    }
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
          message: `Your ${
            successfulOrders.length
          } order(s) have been placed and are being processed.${
            failedCount > 0
              ? ` ${failedCount} order(s) failed. We'll notify you.`
              : ""
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

        // Only clear cart if this checkout came from the cart
        // Don't clear cart for direct product checkouts
        if (isCartCheckout) {
          try {
            clearCart();
            setCartOpen(false);
          } catch (e) {
            // ignore
          }
        }

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

  // If checkout data exists but no items, show empty cart message
  if (checkoutData && checkoutData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your checkout is empty
          </h1>
          <p className="text-gray-600">
            Add some items to your cart or select products to checkout
          </p>
          <Button 
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div>
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="w-20 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="rounded-full w-10 h-10 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold font-pixel text-foreground">
                Checkout
              </h1>
              <p className="text-gray-600 mt-1 hidden md:block">
                Review your order and complete payment
              </p>
            </div>
            <div className="w-20 flex items-center justify-end"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Products & Payment Methods */}
          <div className="lg:col-span-8 space-y-4">
            {/* Product Summary Card */}
            <Card className="bg-background">
              <CardContent className="p-4 lg:p-6">
                <div className="mb-6">
                  {/* images above title. On md+: side-by-side (images left, text right) */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-shrink-0">
                      {checkoutData.items.length === 1 ? (
                        <img
                          src={checkoutData.productDetails.image}
                          alt={checkoutData.productDetails.name}
                          className="w-28 h-28 md:w-36 md:h-36 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex -space-x-2">
                          {checkoutData.items.slice(0, 8).map((it, i) => (
                            <img
                              key={i}
                              src={it.productImage}
                              alt={it.label}
                              className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover border bg-white"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 md:flex-1">
                      <h2
                        className="text-xl font-bold text-gray-900 break-words md:leading-snug"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {checkoutData.items.length === 1
                          ? checkoutData.productDetails.name
                          : `Cart — ${checkoutData.items.length} items`}
                      </h2>
                      <p className="text-gray-600 mt-1 text-sm">
                        {checkoutData.items.length === 1
                          ? checkoutData.productDetails.type
                          : checkoutData.items
                              .map((it) => it.label)
                              .slice(0, 3)
                              .join(", ") +
                            (checkoutData.items.length > 3
                              ? ` and ${checkoutData.items.length - 3} more`
                              : "")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border rounded-md divide-y divide-gray-200">
                  {checkoutData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center hover:bg-popover justify-between p-3 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {item.label}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="w-7 h-7 sm:w-8 sm:h-8 border rounded-full flex items-center justify-center hover:bg-primary transition-colors text-md"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-1 text-sm font-medium min-w-[34px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="w-7 h-7 sm:w-8 sm:h-8 border rounded-full flex items-center justify-center hover:bg-primary transition-colors text-md"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-lg sm:text-xl text-secondary font-anekbangla">
                          ৳{toBanglaNumber(item.price * item.quantity)}
                        </span>

                        <button
                          type="button"
                          className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Method Selection */}
                <div className="pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Delivery Method
                  </h3>
                  
                  {!checkoutData.deliveryInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {availableDeliveryMethods.map((method) => (
                          <Button
                            key={method.id}
                            type="button"
                            variant="outline"
                            className="font-medium text-sm px-3 py-3 flex items-center justify-center gap-2 h-auto"
                            onClick={() => handleDeliveryMethodSelect(method.id)}
                          >
                            <img
                              src={`/assets/icons/${method.icon || method.id}.svg`}
                              alt={method.name}
                              className="w-5 h-5"
                            />
                            <span className="whitespace-nowrap">
                              {method.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        {checkoutData.deliveryInfo.method === "email" ? (
                          <>
                            <img
                              src="/assets/icons/email.svg"
                              alt="Email"
                              className="w-8 h-8 flex-shrink-0"
                            />
                            <div className="flex flex-col text-sm min-w-0">
                              <span className="font-medium text-gray-900 truncate">
                                Email delivery
                              </span>
                              <span className="text-sm text-green-700 font-semibold truncate max-w-[16rem]">
                                {deliveryEmail || checkoutData.deliveryInfo.email || "-"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <img
                              src="/assets/icons/whatsapp.svg"
                              alt="WhatsApp"
                              className="w-8 h-8 flex-shrink-0"
                            />
                            <div className="flex flex-col text-sm min-w-0">
                              <span className="font-medium text-gray-900 truncate">
                                WhatsApp delivery
                              </span>
                              <span className="text-sm text-secondary font-bold truncate max-w-[16rem]">
                                {deliveryPhone || checkoutData.deliveryInfo.phone || "-"}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="ml-auto flex items-center gap-3">
                          <span className="hidden md:inline text-sm text-gray-600">Change</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() => {
                              // Reset delivery info to show selection again
                              setCheckoutData({
                                ...checkoutData,
                                deliveryInfo: undefined,
                              });
                              setSelectedDeliveryMethod(null);
                            }}
                          >
                            <ReloadIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Card */}
            <Card className="border bg-background">
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  Payment Method
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`rounded-lg border-2 ${
                        paymentMethod === method.id
                          ? `${method.borderColor} ${method.bgColor} shadow-lg`
                          : "border-gray-200"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-auto h-16 mx-auto mb-2"
                      />
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

      {/* Delivery Method Selection Modal */}
      <Dialog
        open={showDeliverySelectionModal}
        onOpenChange={(open) => {
          setShowDeliverySelectionModal(open);
          if (!open) setIsEditingDelivery(false);
        }}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="font-medium text-xl text-foreground mb-2 text-center">
              Confirm{" "}
              {selectedDeliveryMethod === "email" ? "Email" : "WhatsApp"}{" "}
              Delivery
            </DialogTitle>
          </DialogHeader>

          {selectedDeliveryMethod === "email" ? (
            <div>
              <p className="text-gray-600 mb-4">
                We'll send your order details and activation codes to this email
                address:
              </p>
              <div className="space-y-3">
                {isEditingDelivery ? (
                  <div className="space-y-2">
                    <Input
                      type="email"
                      className="h-12"
                      placeholder="Enter new email"
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                    />
                    <div className="flex gap-2">
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
                          confirmDeliveryDetailsFromSelection();
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
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span className="font-medium text-foreground">
                        {deliveryEmail || "No email provided"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1"
                        onClick={confirmDeliveryDetailsFromSelection}
                        disabled={!deliveryEmail}
                      >
                        Confirm Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
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
            <div>
              <p className="text-gray-600 mb-4">
                We'll send your order details and activation codes to this
                WhatsApp number:
              </p>
              <div className="space-y-3">
                {isEditingDelivery ? (
                  <div className="space-y-2">
                    <Input
                      type="tel"
                      className="h-12"
                      placeholder="Enter WhatsApp number"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                    />
                    <div className="flex gap-2">
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
                          confirmDeliveryDetailsFromSelection();
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
                    {deliveryPhone ? (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="font-medium text-foreground">
                          {deliveryPhone}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <span className="text-yellow-700">
                          No phone number found. Please add your WhatsApp
                          number.
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="default"
                        className="flex-1"
                        onClick={confirmDeliveryDetailsFromSelection}
                        disabled={!deliveryPhone}
                      >
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
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

          <DialogFooter className="mt-4" />
        </DialogContent>
      </Dialog>

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
                      <p className="font-medium text-gray-900 text-center truncate">
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
                      <p className="font-medium text-gray-900 text-center truncate">
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

      <Footer />
    </div>
  );
};

export default Checkout;
