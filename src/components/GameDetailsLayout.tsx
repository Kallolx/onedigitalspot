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
  uuid?: string;
  setUuid?: (v: string) => void;
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
  uuid,
  setUuid,
  selectedItems = [],
  setSelectedItems,
  onSubmit,
  infoImage,
  isSignedIn = false, // default to false if not provided
}) => {
  const [showInfo, setShowInfo] = useState<null | "player" | "zone" | "uuid">(
    null
  );
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "bkash" | "nagad" | "Rocket" | null
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

    const itemPrice =
      typeof selectedItem.price === "number" ? selectedItem.price : 0;
    return total + itemPrice * item.quantity;
  }, 0);

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Utility to convert English digits to Bangla digits
  const toBanglaNumber = (num: string | number) => {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    // Format with commas (Indian system)
    const formatted = Number(num).toLocaleString("en-IN");
    // Convert to Bangla digits
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  };

  // Handle order creation
  const handleCompletePayment = async () => {
    if (
      !paymentMethod ||
      !userAccount ||
      !trxId ||
      selectedItems.length === 0
    ) {
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Missing Information",
        message:
          "Please fill in all payment details and select at least one item before proceeding.",
      });
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Get current user details
      const user = await getCurrentUser();

      // Determine product type from URL
      let productType = "Unknown";
      if (location.pathname.includes("/mobile-games/")) {
        productType = "Mobile Games";
      } else if (location.pathname.includes("/pc-games/")) {
        productType = "PC Games";
      } else if (location.pathname.includes("/gift-cards/")) {
        productType = "Gift Cards";
      } else if (location.pathname.includes("/ai-tools/")) {
        productType = "AI Tools";
      } else if (location.pathname.includes("/subscriptions/")) {
        productType = "Subscriptions";
      }

      // Create orders for each selected item
      const orderPromises = selectedItems.map(async (selectedItem) => {
        const item =
          priceList[selectedItem.categoryIdx]?.items[selectedItem.itemIdx];
        if (!item) throw new Error("Invalid item selection");

        const itemPrice = typeof item.price === "number" ? item.price : 0;
        const itemTotal = itemPrice * selectedItem.quantity;

        const orderData: Omit<
          OrderData,
          "id" | "orderID" | "createdAt" | "updatedAt"
        > = {
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
          deliveryInfo: undefined,
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
          orderId: newOrders.map((order) => order.orderID).join(", "), // Show all order IDs
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
        message:
          "Failed to create orders. Please check your details and try again. If the problem persists, contact support.",
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
        'Enter the bKash Account Number: <span class="font-bold text-secondary">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-secondary\">${toBanglaNumber(totalAmount)}৳</span>`,
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
      instructions: [
        'Open up the Nagad app & Choose "Send Money"',
        'Enter the Nagad Account Number: <span class="font-bold text-secondary">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-secondary\">${toBanglaNumber(
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
      account: "01831624571",
      type: "Send Money",
      instructions: [
        'Open up the Rocket app & Choose "Send Money"',
        'Enter the Rocket Account Number:  <span class="font-bold text-secondary">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold font-anekbangla text-secondary\">${toBanglaNumber(
          totalAmount
        )}৳</span>`,
        "Confirm the Transaction",
        "After sending money, you'll receive a Rocket Transaction ID",
      ],
    },
  ];

  // Helper functions for multiple selection
  const isItemSelected = (categoryIdx: number, itemIdx: number) => {
    return selectedItems.some(
      (item) => item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );
  };

  const getSelectedItemQuantity = (categoryIdx: number, itemIdx: number) => {
    const found = selectedItems.find(
      (item) => item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );
    return found ? found.quantity : 0;
  };

  const handleItemSelection = (categoryIdx: number, itemIdx: number) => {
    if (!setSelectedItems) return;

    const existingIndex = selectedItems.findIndex(
      (item) => item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
    );

    if (existingIndex >= 0) {
      // Item already selected, remove it (unselect)
      const newSelectedItems = selectedItems.filter(
        (item) =>
          !(item.categoryIdx === categoryIdx && item.itemIdx === itemIdx)
      );
      setSelectedItems(newSelectedItems);
    } else {
      // New item, add to selection with quantity 1
      setSelectedItems([
        ...selectedItems,
        {
          categoryIdx,
          itemIdx,
          quantity: 1,
        },
      ]);
    }
  };

  const updateItemQuantity = (
    categoryIdx: number,
    itemIdx: number,
    newQuantity: number
  ) => {
    if (!setSelectedItems) return;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setSelectedItems(
        selectedItems.filter(
          (item) =>
            !(item.categoryIdx === categoryIdx && item.itemIdx === itemIdx)
        )
      );
    } else {
      // Update quantity
      setSelectedItems(
        selectedItems.map((item) =>
          item.categoryIdx === categoryIdx && item.itemIdx === itemIdx
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
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
      if (setUuid && uuid) setUuid(uuid);
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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-6 font-pixel text-foreground">
          Purchase {title}
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Game Image Section - Compact */}
          <div className="lg:col-span-4">
            <div className="bg-background border rounded-2xl shadow-card p-4 sticky top-8">
              <div className="w-[400px] h-[400px] max-w-full max-h-[80vw] rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-gray-50 relative mx-auto">
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
              <h2 className="font-pixel text-xl tracking-tighter text-foreground font-semibold text-center">
                {title}
              </h2>
              {/* Review text under title */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2  px-3 py-1 ">
                  {/* 5 Star icons */}
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400 drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  ))}
                  <span
                    className="text-md text-gray-700 font-semibold font-sans cursor-pointer transition border-b-2 hover:text-foreground px-1"
                    title="See all reviews"
                  >
                    Reviews{" "}
                    <span className="text-foreground font-bold">(123)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            {/* Price List with Categories */}
            <Card className="mb-6 p-4 bg-transparent">
              <div className="flex flex-col gap-6">
                {priceList.map((category, catIdx) => (
                  <div key={catIdx}>
                    <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80">
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
                              : "ghost"
                          }
                          className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                          onClick={() => handleItemSelection(catIdx, itemIdx)}
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
                            className={`font-bold font-anekbangla transition-colors duration-150 ${
                              isItemSelected(catIdx, itemIdx)
                                ? "text-foreground"
                                : "text-secondary"
                            } group-hover:text-white`}
                          >
                            ৳{toBanglaNumber(item.price)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Purchase Form */}
            <Card className="mb-8 p-4 bg-transparent">
              <form onSubmit={onSubmit || ((e) => e.preventDefault())}>
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Player ID Field */}
                    {typeof playerId !== "undefined" &&
                      typeof setPlayerId !== "undefined" && (
                        <div className="flex-1">
                          <label
                            className="block bg-background font-pixel text-base text-foreground mb-1"
                            htmlFor="playerId"
                          >
                            Player ID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="playerId"
                              className="input w-full border rounded-lg px-4 py-3 text-base bg-background focus:border-primary focus:ring-2 focus:ring-primary transition"
                              placeholder="Enter your Player ID"
                              value={playerId || ""}
                              onChange={(e) =>
                                setPlayerId && setPlayerId(e.target.value)
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground hover:text-blue-600 focus:outline-none"
                              tabIndex={-1}
                              aria-label="Where to find Player ID"
                              onClick={() => setShowInfo("player")}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}

                    {/* UUID Field */}
                    {typeof uuid !== "undefined" &&
                      typeof setUuid !== "undefined" && (
                        <div className="flex-1">
                          <label
                            className="block font-pixel text-base text-foreground mb-1"
                            htmlFor="uuid"
                          >
                            UUID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="uuid"
                              className="input w-full border rounded-lg px-4 py-3 text-base bg-background focus:border-primary focus:ring-2 focus:ring-primary transition"
                              placeholder="Enter your UUID"
                              value={uuid || ""}
                              onChange={(e) =>
                                setUuid && setUuid(e.target.value)
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground hover:text-blue-600 focus:outline-none"
                              tabIndex={-1}
                              aria-label="Where to find UUID"
                              onClick={() => setShowInfo("uuid")}
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
                            className="block font-pixel text-base text-foreground mb-1"
                            htmlFor="zoneId"
                          >
                            Zone ID <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="zoneId"
                              className="input w-full border rounded-lg px-4 py-3 text-base bg-background focus:border-primary focus:ring-2 focus:ring-primary transition"
                              placeholder="Enter your Zone ID"
                              value={zoneId || ""}
                              onChange={(e) =>
                                setZoneId && setZoneId(e.target.value)
                              }
                              required
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground hover:text-blue-600 focus:outline-none"
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
                        className="absolute top-2 right-2 text-gray-500 hover:text-foreground"
                        onClick={() => setShowInfo(null)}
                        aria-label="Close"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h3 className="font-pixel text-lg text-foreground mb-2 text-center">
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
                    <span className="font-pixel text-xl text-foreground font-semibold">
                      Order Summary
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedItems.map((selectedItem, index) => {
                        const item =
                          priceList[selectedItem.categoryIdx]?.items[
                            selectedItem.itemIdx
                          ];
                        if (!item) return null;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900 truncate">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                type="button"
                                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors text-sm"
                                onClick={() =>
                                  updateItemQuantity(
                                    selectedItem.categoryIdx,
                                    selectedItem.itemIdx,
                                    selectedItem.quantity - 1
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium text-sm">
                                {selectedItem.quantity}
                              </span>
                              <button
                                type="button"
                                className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 transition-colors text-sm"
                                onClick={() =>
                                  updateItemQuantity(
                                    selectedItem.categoryIdx,
                                    selectedItem.itemIdx,
                                    selectedItem.quantity + 1
                                  )
                                }
                              >
                                +
                              </button>
                              <span className="ml-1 font-semibold text-foreground text-sm">
                                {typeof item.price === "number"
                                  ? item.price * selectedItem.quantity
                                  : item.price}
                                ৳
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
                      <div className="flex justify-between items-center">
                        <span className="font-pixel text-lg text-foreground font-bold">
                          Total
                        </span>
                        <span className="font-pixel text-2xl text-foreground font-bold">
                          {totalAmount}
                          <span className="text-lg font-normal ml-1">৳</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="default"
                    className="w-full sm:flex-1 font-pixel text-base sm:text-lg flex items-center justify-center gap-2 py-3 sm:py-4"
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
                        <LockKeyIcon
                          className="w-6 h-6 sm:w-7 sm:h-7 mr-2"
                          strokeWidth={3}
                        />
                        <span>Please Login to Continue</span>
                      </>
                    ) : (
                      <>
                        <SentIcon
                          className="w-6 h-6 sm:w-7 sm:h-7 ml-2"
                          strokeWidth={3}
                        />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-36 font-pixel text-base sm:text-lg flex items-center justify-center gap-2 py-3 sm:py-4"
                    disabled={selectedItems.length === 0}
                    onClick={() => {
                      // TODO: Implement add to cart logic
                      alert("Added to cart!");
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </form>
            </Card>

            {/* Enhanced Payment Method Selection */}
            {showPayment && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-8">
                {/* Header */}
                <div className="p-4">
                  <h3 className="font-pixel text-xl text-foreground tracking-tighter mt-2">
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
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 ">
                      {paymentMethods.map((method) => {
                        if (method.id !== paymentMethod) return null;

                        return (
                          <div key={method.id} className="space-y-6">
                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Instructions */}
                              <div className="space-y-4">
                                <h5 className="font-pixel text-base text-foreground mb-4">
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
                                  <h6 className="font-pixel text-sm text-foreground">
                                    Transaction Details
                                  </h6>
                                  <div>
                                    <Input
                                      placeholder={`Enter your ${method.name} number`}
                                      value={userAccount}
                                      onChange={(e) =>
                                        setUserAccount(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div>
                                    <Input
                                      placeholder="Enter Transaction ID (TRX ID)"
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
                                    disabled={
                                      !userAccount ||
                                      !trxId ||
                                      isProcessingOrder
                                    }
                                    onClick={handleCompletePayment}
                                  >
                                    {isProcessingOrder
                                      ? "Processing..."
                                      : "Complete Payment"}
                                  </Button>
                                </div>
                              </div>

                              {/* QR Code and Form */}
                              <div className="">
                                {/* Account Details */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200 mb-8">
                                  <h6 className="font-pixel text-sm text-foreground mb-3">
                                    Account Details
                                  </h6>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-sm">
                                        {method.name} Number:
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans font-semibold text-md">
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
                                        <span className="text-2xl font-bold font-anekbangla text-secondary">
                                          {toBanglaNumber(totalAmount)} BDT
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
                                {/* QR Code */}
                                {method.qr && (
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
                                )}
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
              <Card key={i} className="mb-8 p-4 bg-background">
                <h2 className="font-semibold text-lg mb-2 font-pixel text-foreground">
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
          <h2 className="font-bold text-xl mb-4 font-pixel text-foreground">
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
