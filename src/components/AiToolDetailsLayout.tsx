import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState, useRef } from "react";
import ServiceCard from "@/components/ServiceCard";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X, Lock, Send, Check, Copy } from "lucide-react";
import { RotateLoader } from "react-spinners";
import { account } from "@/lib/appwrite";
import { createOrder, OrderData } from "@/lib/orders";
import OrderStatusModal from "@/components/OrderStatusModal";
import { Input } from "./ui/input";

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

interface AiToolDetailsLayoutProps {
  title: string;
  image: string;
  priceList: PriceCategory[];
  infoSections: InfoSection[];
  similarProducts: any[];
  selected: { categoryIdx: number; itemIdx: number } | null;
  setSelected: React.Dispatch<
    React.SetStateAction<{ categoryIdx: number; itemIdx: number } | null>
  >;
  playerId: string;
  setPlayerId: React.Dispatch<React.SetStateAction<string>>;
  zoneId: string;
  setZoneId: React.Dispatch<React.SetStateAction<string>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  infoImage: string;
  children?: React.ReactNode;
  isSignedIn?: boolean;
}

const AiToolDetailsLayout: React.FC<AiToolDetailsLayoutProps> = ({
  title,
  image,
  priceList,
  infoSections,
  similarProducts,
  selected,
  setSelected,
  quantity,
  setQuantity,
  children,
  isSignedIn = false,
}) => {
  const [purchaseType, setPurchaseType] = useState<"shared" | "personal">(
    "shared"
  );
  const [personalType, setPersonalType] = useState<"existing" | "new">("new");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Payment and order states
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

  // Determine if this is a subscription product based on URL
  const isSubscription = location.pathname.includes("/subscriptions/");

  // Calculate selected item and total amount
  const filteredList =
    priceList.length === 1
      ? priceList // For single category products like Cursor, use all categories
      : priceList.filter((category) =>
          purchaseType === "shared"
            ? title === "GitHub Pro"
              ? category.title.toLowerCase().includes("personal")
              : category.title.toLowerCase().includes("shared")
            : title === "GitHub Pro"
            ? category.title.toLowerCase().includes("team")
            : category.title.toLowerCase().includes("personal")
        );

  const selectedItem =
    selected && filteredList[selected.categoryIdx]?.items[selected.itemIdx];

  const totalAmount =
    selectedItem && typeof selectedItem.price === "number"
      ? selectedItem.price * quantity
      : selectedItem?.price;

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Get current user helper
  const getCurrentUser = async () => {
    try {
      return await account.get();
    } catch (error) {
      throw new Error("User not authenticated");
    }
  };

  // Handle order creation
  const handleCompletePayment = async () => {
    if (!paymentMethod || !userAccount || !trxId || !selectedItem) {
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
      // Get current user details
      const user = await getCurrentUser();

      // Determine product type from URL
      let productType = "AI Tools";
      if (location.pathname.includes("/ai-tools/")) {
        productType = "AI Tools";
      } else if (location.pathname.includes("/subscriptions/")) {
        productType = "Subscriptions";
      } else if (
        location.pathname.includes("/mobile-games/") ||
        location.pathname.includes("/pc-games/")
      ) {
        productType = "Games";
      }

      // Create order data
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
        itemLabel: selectedItem.label,
        quantity: quantity,
        unitPrice:
          typeof selectedItem.price === "number" ? selectedItem.price : 0,
        totalAmount: typeof totalAmount === "number" ? totalAmount : 0,
        playerId:
          !isSubscription &&
          purchaseType === "personal" &&
          personalType === "existing"
            ? email
            : "", // Store email in playerId for AI tools only
        zoneId:
          !isSubscription &&
          purchaseType === "personal" &&
          personalType === "existing"
            ? password
            : "", // Store password in zoneId for AI tools only
        paymentMethod: paymentMethod,
        paymentAccountNumber: userAccount,
        transactionId: trxId,
        status: "Pending",
      };

      // Create the order
      const newOrder = await createOrder(orderData);

      // Show success modal
      setOrderModal({
        isOpen: true,
        status: "success",
        title: "Order Placed Successfully!",
        message: isSubscription
          ? "Your subscription order has been successfully placed and is being processed. You will receive updates via email."
          : "Your AI tool order has been successfully placed and is being processed. You will receive updates via email.",
        orderData: {
          orderId: newOrder.orderID,
          amount: typeof totalAmount === "number" ? totalAmount : 0,
          productName: title,
          transactionId: trxId,
        },
      });

      // Reset form
      setShowPayment(false);
      setPaymentMethod(null);
      setUserAccount("");
      setTrxId("");
    } catch (error) {
      console.error("Error creating order:", error);
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "Order Failed",
        message:
          "Failed to create order. Please check your details and try again. If the problem persists, contact support.",
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
        'Enter the bKash Account Number: <span class="font-bold text-foreground">01831624571</span>',
        `Enter the exact amount: <span class=\"font-bold text-foreground\">${totalAmount}৳</span>`,
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
        "Enter the Nagad Account Number: 01831624571",
        `Enter the exact amount: ${totalAmount}৳`,
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
        "Enter the Rocket Account Number: 01831624571",
        `Enter the exact amount: ${totalAmount}৳`,
        "Confirm the Transaction",
        "After sending money, you'll receive a Rocket Transaction ID",
      ],
    },
  ];

  // Always scroll to top when this layout mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Load saved inputs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aiToolOrderInputs");
    if (saved) {
      const {
        selected,
        purchaseType,
        personalType,
        email,
        quantity,
        pathname,
      } = JSON.parse(saved);
      if (selected) setSelected(selected);
      if (purchaseType) setPurchaseType(purchaseType);
      if (personalType) setPersonalType(personalType);
      if (email) setEmail(email);
      if (quantity) setQuantity(quantity);
      localStorage.removeItem("aiToolOrderInputs");
    }
  }, []);

  // Image loading effects
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
          {/* Image Section */}
          <div className="lg:col-span-4">
            <div className="bg-muted rounded-2xl shadow-card p-6 sticky top-8">
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
          {/* Main Content */}
          <div className="flex-1">
            {/* Purchase Type Switcher - Only show if there are multiple categories */}
            {priceList.length > 1 && (
              <Card className="mb-6 p-4">
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    type="button"
                    variant={purchaseType === "shared" ? "default" : "ghost"}
                    onClick={() => setPurchaseType("shared")}
                    className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                  >
                    {title === "GitHub Pro"
                      ? "Personal"
                      : isSubscription
                      ? "Non-Renewable"
                      : "Shared Account"}
                  </Button>
                  <Button
                    type="button"
                    variant={purchaseType === "personal" ? "default" : "ghost"}
                    onClick={() => setPurchaseType("personal")}
                    className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                  >
                    {title === "GitHub Pro"
                      ? "Team"
                      : isSubscription
                      ? "Renewable"
                      : "Personal Account"}
                  </Button>
                </div>
                {/* Price List for Shared Account */}
                {purchaseType === "shared" && (
                  <div className="flex flex-col gap-6">
                    {priceList
                      .filter((category) =>
                        title === "GitHub Pro"
                          ? category.title.toLowerCase().includes("personal")
                          : category.title.toLowerCase().includes("shared")
                      )
                      .map((category, catIdx) => (
                        <div key={catIdx}>
                          <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80 flex items-center gap-2">
                            {category.title}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {category.items.map((item, itemIdx) => (
                              <Button
                                key={itemIdx}
                                type="button"
                                variant={
                                  selected &&
                                  selected.categoryIdx === catIdx &&
                                  selected.itemIdx === itemIdx
                                    ? "default"
                                    : "outline"
                                }
                                className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                                onClick={() =>
                                  setSelected({ categoryIdx: catIdx, itemIdx })
                                }
                              >
                                <span className="flex items-center gap-2">
                                  {category.categoryIcon && (
                                    <img
                                      src={category.categoryIcon}
                                      alt="icon"
                                      className="w-5 h-5 text-foreground"
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
                                </span>
                                <span
                                  className={`font-bold font-anekbangla transition-colors duration-150 ${
                                    selected &&
                                    selected.categoryIdx === catIdx &&
                                    selected.itemIdx === itemIdx
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
                )}
                {/* Personal Account Options */}
                {purchaseType === "personal" && (
                  <>
                    <div className="flex flex-col gap-4 mb-4">
                      {/* Sub-tabs only for AI tools */}
                      {!isSubscription && title !== "GitHub Pro" && (
                        <div className="flex gap-4 mb-2">
                          <Button
                            type="button"
                            variant={
                              personalType === "new" ? "default" : "ghost"
                            }
                            onClick={() => {
                              setPersonalType("new");
                              setSelected(null);
                            }}
                            className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                          >
                            Recieve New Account
                          </Button>
                          <Button
                            type="button"
                            variant={
                              personalType === "existing" ? "default" : "ghost"
                            }
                            onClick={() => {
                              setPersonalType("existing");
                              setSelected(null);
                            }}
                            className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                          >
                            {title === "GitHub"
                              ? "use existing one"
                              : "Use Existing Account"}
                          </Button>
                        </div>
                      )}
                      {/* Price List for Personal Account */}
                      <div className="flex flex-col gap-6">
                        {priceList
                          .filter((category) =>
                            title === "GitHub Pro"
                              ? category.title.toLowerCase().includes("team")
                              : category.title
                                  .toLowerCase()
                                  .includes("personal")
                          )
                          .map((category, catIdx) => (
                            <div key={catIdx}>
                              <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80 flex items-center gap-2">
                                {category.title}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {category.items.map((item, itemIdx) => (
                                  <Button
                                    key={itemIdx}
                                    type="button"
                                    variant={
                                      selected &&
                                      selected.categoryIdx === catIdx &&
                                      selected.itemIdx === itemIdx
                                        ? "default"
                                        : "outline"
                                    }
                                    className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                                    onClick={() =>
                                      setSelected({
                                        categoryIdx: catIdx,
                                        itemIdx,
                                      })
                                    }
                                  >
                                    <span className="flex items-center gap-2">
                                      {category.categoryIcon && (
                                        <img
                                          src={category.categoryIcon}
                                          alt="icon"
                                          className="w-5 h-5 text-foreground"
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
                                    </span>
                                    <span
                                      className={`font-bold font-anekbangla transition-colors duration-150 ${
                                        selected &&
                                        selected.categoryIdx === catIdx &&
                                        selected.itemIdx === itemIdx
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
                      {/* Account details form only for AI tools with existing account */}
                      {!isSubscription && personalType === "existing" && (
                        <div className="flex flex-col gap-3">
                          <label className="font-pixel text-base text-foreground">
                            Provide your details
                          </label>
                          <input
                            className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:outline-none transition"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <input
                            className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:outline-none transition"
                            placeholder="Enter your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Show all price lists when there's only one category */}
            {priceList.length === 1 && (
              <Card className="mb-6 p-4">
                <div className="flex flex-col gap-6">
                  {priceList.map((category, catIdx) => (
                    <div key={catIdx}>
                      <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80 flex items-center gap-2">
                        {category.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map((item, itemIdx) => (
                          <Button
                            key={itemIdx}
                            type="button"
                            variant={
                              selected &&
                              selected.categoryIdx === catIdx &&
                              selected.itemIdx === itemIdx
                                ? "default"
                                : "outline"
                            }
                            className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                            onClick={() =>
                              setSelected({ categoryIdx: catIdx, itemIdx })
                            }
                          >
                            <span className="flex items-center gap-2">
                              {category.categoryIcon && (
                                <img
                                  src={category.categoryIcon}
                                  alt="icon"
                                  className="w-5 h-5 text-foreground"
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
                            </span>
                            <span
                              className={`font-bold transition-colors duration-150 ${
                                selected &&
                                selected.categoryIdx === catIdx &&
                                selected.itemIdx === itemIdx
                                  ? "text-white"
                                  : "text-foreground"
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
            )}

            {/* Quantity, Order Summary, and Proceed Button */}
            <Card className="mb-8 p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-pixel text-base text-foreground">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 border-2 border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    className="w-20 border-2 border-border rounded-lg text-base bg-primary p-2 text-center focus:border-primary focus:outline-none transition-colors"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                  <button
                    type="button"
                    className="w-10 h-10 border-2 border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Order Summary and Proceed Button */}
              {selected !== null && selectedItem && (
                <>
                  <div className="rounded-xl border border-primary/30 px-4 py-3 mb-3 flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-pixel text-xl text-foreground font-semibold mt-1">
                        Total
                      </span>
                    </div>
                    <span className="font-pixel text-2xl text-foreground font-bold whitespace-nowrap flex items-center gap-2">
                      <span className="block text-base font-normal text-foreground mr-2">
                        {selectedItem.label} x{quantity}
                      </span>
                      <span className="block text-xl font-bold text-foreground">
                        {totalAmount}
                        <span className="text-lg font-normal ml-1">৳</span>
                      </span>
                    </span>
                  </div>
                  <Button
                    className="w-full font-pixel text-lg mt-2 flex items-center justify-center gap-2"
                    type="button"
                    disabled={
                      !selected ||
                      (!isSubscription &&
                        purchaseType === "personal" &&
                        personalType === "existing" &&
                        (!email || !password))
                    }
                    onClick={() => {
                      if (!isSignedIn) {
                        localStorage.setItem(
                          "aiToolOrderInputs",
                          JSON.stringify({
                            selected,
                            purchaseType,
                            personalType,
                            email,
                            quantity,
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
                        <Lock className="w-7 h-7 mr-2" strokeWidth={3} />
                        <span>Please Login to Continue</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-7 h-7 ml-2" strokeWidth={3} />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </>
              )}
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
                                    disabled={
                                      !userAccount ||
                                      !trxId ||
                                      isProcessingOrder
                                    }
                                    onClick={handleCompletePayment}
                                  >
                                    {isProcessingOrder
                                      ? "Placing..."
                                      : "Place Order"}
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
              <Card key={i} className="mb-8 p-4">
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

export default AiToolDetailsLayout;
