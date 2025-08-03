import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ServiceCard from "@/components/ServiceCard";
import OrderStatusModal from "@/components/OrderStatusModal";
import React, { useState, useEffect, useRef } from "react";
import { Info, X, Copy, Check } from "lucide-react";
import { LockKeyIcon, SentIcon } from "hugeicons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import { createOrder, getCurrentUser, OrderData } from "../lib/orders";

interface PriceItem {
  label: string;
  price: number | string;
  hot?: boolean;
}

interface PriceCategory {
  title: string;
  items: PriceItem[];
  categoryIcon?: string;
}

interface InfoSection {
  title: string;
  content: React.ReactNode;
}

interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

interface GameDetailsLayoutProps {
  title: string;
  image: string;
  priceList: PriceCategory[];
  infoSections: InfoSection[];
  similarProducts: any[];
  children?: React.ReactNode;
  playerId?: string;
  setPlayerId?: (v: string) => void;
  zoneId?: string;
  setZoneId?: (v: string) => void;
  // Remove the legacy single selection props - now using multiple selection
  selectedItems?: SelectedItem[];
  setSelectedItems?: (v: SelectedItem[]) => void;
  onSubmit?: (e: React.FormEvent) => void;
  infoImage?: string;
}

const GameDetailsLayout: React.FC<
  GameDetailsLayoutProps & { isSignedIn?: boolean }
> = ({
  title,
  image,
  priceList,
  infoSections,
  similarProducts,
  children,
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  selectedItems = [],
  setSelectedItems,
  onSubmit,
  infoImage,
  isSignedIn = false, // default to false if not provided
}) => {
  const [showInfo, setShowInfo] = useState<null | "player" | "zone">(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "bkash" | "nagad" | "pathaopay" | null
  >(null);
  const [userAccount, setUserAccount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [copiedText, setCopiedText] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
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
  const imgRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate total amount from all selected items
  const totalAmount = selectedItems.reduce((total, item) => {
    const selectedItem = priceList[item.categoryIdx]?.items[item.itemIdx];
    if (!selectedItem) return total;
    
    const itemPrice = typeof selectedItem.price === "number" ? selectedItem.price : 0;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Handle order creation
  const handleCompletePayment = async () => {
    if (!paymentMethod || !userAccount || !trxId || selectedItems.length === 0) {
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Missing Information",
        message: "Please fill in all payment details and select at least one item before proceeding.",
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Get current user details
      const user = await getCurrentUser();
      
      // Determine product type from URL
      let productType = "Unknown";
      if (location.pathname.includes('/mobile-games/')) {
        productType = "Mobile Games";
      } else if (location.pathname.includes('/pc-games/')) {
        productType = "PC Games";
      } else if (location.pathname.includes('/gift-cards/')) {
        productType = "Gift Cards";
      } else if (location.pathname.includes('/ai-tools/')) {
        productType = "AI Tools";
      } else if (location.pathname.includes('/subscriptions/')) {
        productType = "Subscriptions";
      }

      // Create orders for each selected item
      const orderPromises = selectedItems.map(async (selectedItem) => {
        const item = priceList[selectedItem.categoryIdx]?.items[selectedItem.itemIdx];
        if (!item) throw new Error("Invalid item selection");

        const itemPrice = typeof item.price === "number" ? item.price : 0;
        const itemTotal = itemPrice * selectedItem.quantity;

        const orderData: Omit<OrderData, 'id' | 'orderID' | 'createdAt' | 'updatedAt'> = {
          userId: user.$id,
          userName: user.name || "Guest User",
          userEmail: user.email || "",
          productType,
          productName: title,
          productImage: image,
          itemLabel: item.label,
          quantity: selectedItem.quantity,
          unitPrice: itemPrice,
          totalAmount: itemTotal,
          playerId: playerId || "",
          zoneId: zoneId || "",
          paymentMethod: paymentMethod,
          paymentAccountNumber: userAccount,
          transactionId: trxId,
          status: "Pending",
        };

        return await createOrder(orderData);
      });

      // Wait for all orders to be created
      const newOrders = await Promise.all(orderPromises);
      
      // Show success modal
      setOrderModal({
        isOpen: true,
        status: "success",
        title: "Orders Placed Successfully!",
        message: `${newOrders.length} order(s) have been successfully placed and are being processed. You will receive updates via email.`,
        orderData: {
          orderId: newOrders.map(order => order.orderID).join(", "), // Show all order IDs
          amount: totalAmount,
          productName: title,
          transactionId: trxId,
        },
      });
      
      // Reset form
      setShowPayment(false);
      setPaymentMethod(null);
      setUserAccount("");
      setTrxId("");
      if (setSelectedItems) setSelectedItems([]);
      
    } catch (error) {
      console.error("Error creating orders:", error);
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Order Failed",
        message: "Failed to create orders. Please check your details and try again. If the problem persists, contact support.",
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
      account: "01831624571",
      type: "Send Money",
      qr: "/assets/qr/bkash.png",
      instructions: [
        'Open up the bKash app & Choose "Send Money" Its a Personal Account',
        "Enter the bKash Account Number: <span class=\"font-bold text-primary\">01831624571</span>",
        `Enter the exact amount: <span class=\"font-bold text-primary\">${totalAmount}৳</span>`,
        "Confirm the Transaction",
        "After sending money, you'll receive a bKash Transaction ID (TRX ID)",
      ],
    },
    {
      id: "nagad" as const,
      name: "Nagad",
      icon: "/assets/icons/nagad.svg",
      color: "from-orange-500 to-red-500",
      account: "01831624571",
      type: "Send Money",
      qr: "/assets/qr/nagad.png",
      instructions: [
        'Open up the Nagad app & Choose "Send Money"',
        "Enter the Nagad Account Number: 017XXXXXXXX",
        `Enter the exact amount: ${totalAmount}৳`,
        "Confirm the Transaction",
        "After sending money, you'll receive a Nagad Transaction ID",
      ],
    },
    {
      id: "pathaopay" as const,
      name: "Pathao Pay",
      icon: "/assets/icons/visa.svg",
      color: "from-blue-500 to-purple-600",
      account: "pathaopay.me/@yourtag",
      type: "Send Money",
      qr: "/assets/qr/pathaopay.png",
      instructions: [
        "Open Pathao Pay and send to pathaopay.me/@yourtag",
        `Enter the exact amount: ${totalAmount}৳`,
        "Confirm the Transaction",
      ],
    },
  ];

  // Helper functions for multiple selection
  const isItemSelected = (categoryIdx: number, itemIdx: number) => {
    return selectedItems.some(item => 
      item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );
  };

  const getSelectedItemQuantity = (categoryIdx: number, itemIdx: number) => {
    const found = selectedItems.find(item => 
      item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );
    return found ? found.quantity : 0;
  };

  const handleItemSelection = (categoryIdx: number, itemIdx: number) => {
    if (!setSelectedItems) return;

    const existingIndex = selectedItems.findIndex(item => 
      item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );

    if (existingIndex >= 0) {
      // Item already selected, increase quantity
      const newSelectedItems = [...selectedItems];
      newSelectedItems[existingIndex].quantity += 1;
      setSelectedItems(newSelectedItems);
    } else {
      // New item, add to selection
      setSelectedItems([...selectedItems, {
        categoryIdx,
        itemIdx,
        quantity: 1
      }]);
    }
  };

  const updateItemQuantity = (categoryIdx: number, itemIdx: number, newQuantity: number) => {
    if (!setSelectedItems) return;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setSelectedItems(selectedItems.filter(item => 
        !(item.categoryIdx === categoryIdx && item.itemIdx === itemIdx)
      ));
    } else {
      // Update quantity
      setSelectedItems(selectedItems.map(item => 
        item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Always scroll to top when this layout mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("gameOrderInputs");
    if (saved) {
      const { selectedItems, playerId, zoneId, pathname } = JSON.parse(saved);
      if (setSelectedItems && selectedItems) setSelectedItems(selectedItems);
      if (setPlayerId && playerId) setPlayerId(playerId);
      if (setZoneId && zoneId) setZoneId(zoneId);
      localStorage.removeItem("gameOrderInputs");
    }
  }, []);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [image]);

  useEffect(() => {
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth !== 0
    ) {
      setImgLoaded(true);
    }
  }, [image]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-6 font-pixel text-primary">
          {title} Top Up
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Game Image Section - Compact */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-8">
              <div
                className="w-[400px] h-[400px] max-w-full max-h-[80vw] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-gray-50 relative mx-auto"
              >
                {/* Loader while loading or error */}
                {(!imgLoaded || imgError) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <RotateLoader color="green" size={10} />
                  </div>
                )}
                <img
                  ref={imgRef}
                  src={image}
                  alt={title}
                  width={800}
                  height={800}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    imgLoaded && !imgError ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  style={{ minHeight: 0, minWidth: 0 }}
                  draggable={false}
                />
              </div>
              <h2 className="font-pixel text-xl tracking-tighter text-primary font-semibold text-center">
                {title}
              </h2>
            </div>
          </div>
          <div className="flex-1">
            {/* Price List with Categories */}
            <Card className="mb-6 p-4">
              <div className="flex flex-col gap-6">
                {priceList.map((category, catIdx) => (
                  <div key={catIdx}>
                    <h3 className="font-pixel text-base text-primary mb-2 pl-1 opacity-80">
                      {category.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {category.items.map((item, itemIdx) => (
                        <Button
                          key={itemIdx}
                          type="button"
                          variant={
                            isItemSelected(catIdx, itemIdx)
                              ? "default"
                              : "outline"
                          }
                          className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                          onClick={() =>
                            handleItemSelection(catIdx, itemIdx)
                          }
                        >
                          <span className="flex items-center gap-2">
                            {category.categoryIcon && (
                              <img
                                src={category.categoryIcon}
                                alt="icon"
                                className="inline-block w-6 h-6 mr-1"
                                loading="lazy"
                              />
                            )}
                            {item.label}
                            {item.hot && (
                              <span className="ml-1">
                                <img
                                  src="/assets/icons/fire.svg"
                                  alt="Popular"
                                  className="inline-block mr-1 w-4 h-4"
                                />
                              </span>
                            )}
                            {/* Show quantity badge if selected */}
                            {isItemSelected(catIdx, itemIdx) && (
                              <span className="ml-2 bg-white/20 text-white px-2 py-1 rounded-full text-sm font-bold">
                                {getSelectedItemQuantity(catIdx, itemIdx)}
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-bold transition-colors duration-150 ${
                              isItemSelected(catIdx, itemIdx)
                                ? "text-white"
                                : "text-primary"
                            } group-hover:text-white`}
                          >
                            {item.price}৳
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Purchase Form */}
            <Card className="mb-8 p-4">
              <form onSubmit={onSubmit || ((e) => e.preventDefault())}>
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Player ID Field */}
                    {typeof playerId !== "undefined" &&
                      typeof setPlayerId !== "undefined" && (
                        <div className="flex-1">
                          <label
                            className="block font-pixel text-base text-primary mb-1"
                            htmlFor="playerId"
                          >
                            Player ID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="playerId"
                              className="input w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:ring-2 focus:ring-primary transition"
                              placeholder="Enter your Player ID"
                              value={playerId || ""}
                              onChange={(e) =>
                                setPlayerId && setPlayerId(e.target.value)
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-600 focus:outline-none"
                              tabIndex={-1}
                              aria-label="Where to find Player ID"
                              onClick={() => setShowInfo("player")}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Zone ID Field */}
                    {typeof zoneId !== "undefined" &&
                      typeof setZoneId !== "undefined" && (
                        <div className="flex-1">
                          <label
                            className="block font-pixel text-base text-primary mb-1"
                            htmlFor="zoneId"
                          >
                            Zone ID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="zoneId"
                              className="input w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:ring-2 focus:ring-primary transition"
                              placeholder="Enter your Zone ID"
                              value={zoneId || ""}
                              onChange={(e) =>
                                setZoneId && setZoneId(e.target.value)
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-600 focus:outline-none"
                              tabIndex={-1}
                              aria-label="Where to find Zone ID"
                              onClick={() => setShowInfo("zone")}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Info Modal */}
                {showInfo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-primary"
                        onClick={() => setShowInfo(null)}
                        aria-label="Close"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h3 className="font-pixel text-lg text-primary mb-2 text-center">
                        Where to find{" "}
                        {showInfo === "player" ? "Player ID" : "Zone ID"}?
                      </h3>
                      {infoImage && (
                        <img
                          src={infoImage}
                          alt="How to find ID"
                          className="rounded-lg w-full"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Multiple Items Display - replaces old quantity selector */}
                {selectedItems.length > 0 && (
                  <div className="mb-4">
                    <label className="font-pixel text-base text-primary mb-2 block">
                      Selected Items
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedItems.map((selectedItem, index) => {
                        const item = priceList[selectedItem.categoryIdx]?.items[selectedItem.itemIdx];
                        if (!item) return null;
                        
                        return (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900 truncate">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                type="button"
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                onClick={() =>
                                  updateItemQuantity(selectedItem.categoryIdx, selectedItem.itemIdx, selectedItem.quantity - 1)
                                }
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-medium">
                                {selectedItem.quantity}
                              </span>
                              <button
                                type="button"
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                onClick={() =>
                                  updateItemQuantity(selectedItem.categoryIdx, selectedItem.itemIdx, selectedItem.quantity + 1)
                                }
                              >
                                +
                              </button>
                              <span className="ml-2 font-semibold text-primary">
                                {typeof item.price === "number" ? item.price * selectedItem.quantity : item.price}৳
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                {selectedItems.length > 0 && (
                  <div className="rounded-xl border border-primary/30 px-4 py-3 mb-3 shadow-sm">
                    <div className="flex flex-col gap-2">
                      <span className="font-pixel text-xl text-primary font-semibold">
                        Order Summary
                      </span>
                      <div className="space-y-1">
                        {selectedItems.map((selectedItem, index) => {
                          const item = priceList[selectedItem.categoryIdx]?.items[selectedItem.itemIdx];
                          if (!item) return null;
                          
                          const itemPrice = typeof item.price === "number" ? item.price : 0;
                          const itemTotal = itemPrice * selectedItem.quantity;
                          
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.label} x{selectedItem.quantity}
                              </span>
                              <span className="font-medium text-primary">
                                {itemTotal}৳
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-pixel text-lg text-primary font-bold">
                            Total
                          </span>
                          <span className="font-pixel text-2xl text-primary font-bold">
                            {totalAmount}
                            <span className="text-lg font-normal ml-1">৳</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="default"
                  className="w-full font-pixel text-lg mt-2 flex items-center justify-center gap-2"
                  disabled={
                    selectedItems.length === 0 ||
                    (typeof playerId !== "undefined" && !playerId) ||
                    (typeof zoneId !== "undefined" && !zoneId)
                  }
                  onClick={() => {
                    if (!isSignedIn) {
                      localStorage.setItem(
                        "gameOrderInputs",
                        JSON.stringify({
                          selectedItems,
                          playerId,
                          zoneId,
                          pathname: location.pathname,
                        })
                      );
                      navigate(
                        `/auth/login?redirect=${encodeURIComponent(
                          location.pathname
                        )}`
                      );
                    } else {
                      setShowPayment(true);
                    }
                  }}
                >
                  {!isSignedIn ? (
                    <>
                      <LockKeyIcon className="w-7 h-7 mr-2" strokeWidth={3} />
                      <span>Please Login to Continue</span>
                    </>
                  ) : (
                    <>
                      <SentIcon className="w-7 h-7 ml-2" strokeWidth={3} />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Enhanced Payment Method Selection */}
            {showPayment && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-8">
                {/* Header */}
                <div className="p-4">
                  <h3 className="font-pixel text-xl text-primary tracking-tighter mt-2">
                    Choose Payment Method
                  </h3>
                </div>

                {/* Payment Methods Grid */}
                <div className=" p-4">
                  <div className="flex gap-4 mb-8 items-start justify-start">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        type="button"
                        variant={
                          paymentMethod === method.id ? "default" : "outline"
                        }
                        className={`font-pixel text-base px-6 py-3 rounded-xl ${
                          paymentMethod === method.id
                            ? "bg-primary text-white"
                            : ""
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <img
                          src={method.icon}
                          alt={method.name}
                          className="w-18 h-10 inline-block align-middle"
                        />
                      </Button>
                    ))}
                  </div>

                  {/* Payment Details */}
                  {paymentMethod && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                      {paymentMethods.map((method) => {
                        if (method.id !== paymentMethod) return null;

                        return (
                          <div key={method.id} className="space-y-6">
                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Instructions */}
                              <div className="space-y-4">
                                <h5 className="font-pixel text-base text-primary mb-4">
                                  {method.name} Payment Instructions
                                </h5>

                                <ol className="space-y-3 text-sm">
                                  {method.instructions.map(
                                    (instruction, idx) => (
                                      <li key={idx} className="flex gap-3">
                                        <span
                                          className={`flex-shrink-0 w-6 h-6 bg-gradient-to-br ${method.color} text-white rounded-full flex items-center justify-center text-xs font-bold`}
                                        >
                                          {idx + 1}
                                        </span>
                                        <span
                                          className="text-base text-gray-500 font-pixel tracking-tight"
                                          dangerouslySetInnerHTML={{
                                            __html: instruction,
                                          }}
                                        />
                                      </li>
                                    )
                                  )}
                                </ol>

                                {/* Form */}
                                <div className="space-y-4">
                                  <h6 className="font-pixel text-sm text-primary">
                                    Transaction Details
                                  </h6>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                      Your {method.name} Account
                                    </label>
                                    <Input
                                      placeholder={`Enter your ${method.name} number`}
                                      value={userAccount}
                                      onChange={(e) =>
                                        setUserAccount(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                      Transaction ID (TRX ID)
                                    </label>
                                    <Input
                                      placeholder="Enter transaction ID"
                                      value={trxId}
                                      onChange={(e) => setTrxId(e.target.value)}
                                    />
                                  </div>

                                  <Button
                                    className={`w-full font-pixel ${
                                      userAccount && trxId && !isProcessingOrder
                                        ? `bg-gradient-to-r ${method.color} text-white hover:shadow-lg`
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                                    disabled={!userAccount || !trxId || isProcessingOrder}
                                    onClick={handleCompletePayment}
                                  >
                                    {isProcessingOrder ? "Processing..." : "Complete Payment"}
                                  </Button>
                                </div>
                              </div>

                              {/* QR Code and Form */}
                              <div className="">
                                {/* QR Code */}
                                <div className="text-center mb-6">
                                  <img
                                    src={method.qr}
                                    alt={`${method.name} QR`}
                                    className="w-64 h-64 mx-auto rounded-xl"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const fallback =
                                        target.nextSibling as HTMLElement;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                  <div className="w-56 h-56 bg-gray-100 rounded-lg items-center justify-center text-gray-400 text-sm hidden">
                                    <img
                                      src={method.qr}
                                      alt={`${method.name} QR`}
                                    />
                                  </div>
                                </div>

                                {/* Account Details */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200 mt-6">
                                  <h6 className="font-pixel text-sm text-primary mb-3">
                                    Account Details
                                  </h6>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-sm">
                                        {method.name} Number:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-md">
                                          {method.account}
                                        </span>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              method.account,
                                              "account"
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
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
                                      <span className="text-gray-600 text-sm">
                                        Total:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans text-xl font-bold">
                                          = {totalAmount} BDT
                                        </span>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              totalAmount?.toString() || "",
                                              "amount"
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
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
                                  {/* Apply Coupon Field (Mock) */}
                                  <div className="mt-4 flex gap-2 items-center">
                                    <Input
                                      type="text"
                                      placeholder="Enter coupon code"
                                      className="font-pixel"
                                      // You can add value/onChange if you want to handle state
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="font-pixel"
                                      size="sm"
                                      // onClick={() => {/* mock apply logic */}}
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                  <span className="text-xs text-gray-400 mt-1 block">
                                    Coupon is optional
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Section */}
            {infoSections.map((section, i) => (
              <Card key={i} className="mb-8 p-4">
                <h2 className="font-semibold text-lg mb-2 font-pixel text-primary">
                  {section.title}
                </h2>
                <div>{section.content}</div>
              </Card>
            ))}
            {children}
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="font-bold text-xl mb-4 font-pixel text-primary">
            Similar Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarProducts.map((prod, i) => (
              <ServiceCard key={i} {...prod} />
            ))}
          </div>
        </div>
      </main>

      {/* Order Status Modal */}
      <OrderStatusModal
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal({ ...orderModal, isOpen: false })}
        status={orderModal.status}
        title={orderModal.title}
        message={orderModal.message}
        orderData={orderModal.orderData}
        onViewOrders={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          navigate("/my-orders");
        }}
        onRetry={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          // Reset form to allow retry
          setPaymentMethod(null);
          setUserAccount("");
          setTrxId("");
        }}
      />
    </div>
  );
};

export default GameDetailsLayout;
