import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState, useRef } from "react";
import ServiceCard from "@/components/ServiceCard";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, X, Lock, Send } from "lucide-react";
import { RotateLoader } from "react-spinners";
import { account } from "@/lib/appwrite";
import { createOrder, OrderData } from "@/lib/orders";
import OrderStatusModal from "@/components/OrderStatusModal";

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
  setSelected: React.Dispatch<React.SetStateAction<{ categoryIdx: number; itemIdx: number } | null>>;
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
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  quantity,
  setQuantity,
  infoImage,
  children,
  isSignedIn = false,
}) => {
  const [purchaseType, setPurchaseType] = useState<"shared" | "personal">(
    "shared"
  );
  const [personalType, setPersonalType] = useState<"existing" | "new">(
    "new"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Payment and order states
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

  // Determine if this is a subscription product based on URL
  const isSubscription = location.pathname.includes('/subscriptions/');
  
  // Calculate selected item and total amount
  const filteredList = priceList.filter(category =>
    purchaseType === "shared"
      ? category.title.toLowerCase().includes("shared")
      : category.title.toLowerCase().includes("personal")
  );
  
  const selectedItem = selected && filteredList[selected.categoryIdx]?.items[selected.itemIdx];
  
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
      if (location.pathname.includes('/ai-tools/')) {
        productType = "AI Tools";
      } else if (location.pathname.includes('/subscriptions/')) {
        productType = "Subscriptions";
      } else if (location.pathname.includes('/mobile-games/') || location.pathname.includes('/pc-games/')) {
        productType = "Games";
      }

      // Create order data
      const orderData: Omit<OrderData, 'id' | 'orderID' | 'createdAt' | 'updatedAt'> = {
        userId: user.$id,
        userName: user.name || "Guest User",
        userEmail: user.email || "",
        productType,
        productName: title,
        productImage: image,
        itemLabel: selectedItem.label,
        quantity: quantity,
        unitPrice: typeof selectedItem.price === "number" ? selectedItem.price : 0,
        totalAmount: typeof totalAmount === "number" ? totalAmount : 0,
        playerId: (!isSubscription && purchaseType === "personal" && personalType === "existing") ? email : "", // Store email in playerId for AI tools only
        zoneId: (!isSubscription && purchaseType === "personal" && personalType === "existing") ? password : "", // Store password in zoneId for AI tools only
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
        message: "Failed to create order. Please check your details and try again. If the problem persists, contact support.",
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

    // Always scroll to top when this layout mounts
    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

    // Load saved inputs from localStorage
    useEffect(() => {
      const saved = localStorage.getItem("aiToolOrderInputs");
      if (saved) {
        const { selected, purchaseType, personalType, email, quantity, pathname } = JSON.parse(saved);
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
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-6 font-pixel text-primary">
          Purchase {title}
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Section */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-8">
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
              <h2 className="font-pixel text-xl tracking-tighter text-primary font-semibold text-center">
                {title}
              </h2>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Purchase Type Switcher */}
            <Card className="mb-6 p-4">
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  type="button"
                  variant={purchaseType === "shared" ? "default" : "outline"}
                  onClick={() => setPurchaseType("shared")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  {isSubscription ? "Non-Renewable" : "Shared Account"}
                </Button>
                <Button
                  type="button"
                  variant={purchaseType === "personal" ? "default" : "outline"}
                  onClick={() => setPurchaseType("personal")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  {isSubscription ? "Renewable" : "Personal Account"}
                </Button>
              </div>
              {/* Price List for Shared Account */}
              {purchaseType === "shared" && (
                <div className="flex flex-col gap-6">
                  {priceList
                    .filter((category) =>
                      category.title.toLowerCase().includes("shared")
                    )
                    .map((category, catIdx) => (
                      <div key={catIdx}>
                        <h3 className="font-pixel text-base text-primary mb-2 pl-1 opacity-80 flex items-center gap-2">
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
                                    className="w-5 h-5 text-primary"
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
              )}
              {/* Personal Account Options */}
              {purchaseType === "personal" && (
                <>
                  <div className="flex flex-col gap-4 mb-4">
                    {/* Sub-tabs only for AI tools */}
                    {!isSubscription && (
                      <div className="flex gap-4 mb-2">
                        <Button
                          type="button"
                          variant={personalType === "new" ? "default" : "outline"}
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
                            personalType === "existing" ? "default" : "outline"
                          }
                          onClick={() => {
                            setPersonalType("existing");
                            setSelected(null);
                          }}
                          className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                        >
                          Use Existing Account
                        </Button>
                      </div>
                    )}
                    {/* Price List for Personal Account */}
                    <div className="flex flex-col gap-6">
                      {priceList
                        .filter((category) =>
                          category.title.toLowerCase().includes("personal")
                        )
                        .map((category, catIdx) => (
                          <div key={catIdx}>
                            <h3 className="font-pixel text-base text-primary mb-2 pl-1 opacity-80 flex items-center gap-2">
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
                                        className="w-5 h-5 text-primary"
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
                    {/* Account details form only for AI tools with existing account */}
                    {!isSubscription && personalType === "existing" && (
                      <div className="flex flex-col gap-3">
                        <label className="font-pixel text-base text-primary">
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
            {/* Quantity, Order Summary, and Proceed Button */}
            <Card className="mb-8 p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-pixel text-base text-primary">
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
                    className="w-20 border-2 border-border rounded-lg px-3 py-2 text-base bg-white text-center focus:border-primary focus:outline-none transition-colors"
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
                      <span className="font-pixel text-xl text-primary font-semibold mt-1">
                        Total
                      </span>
                    </div>
                    <span className="font-pixel text-2xl text-primary font-bold whitespace-nowrap flex items-center gap-2">
                      <span className="block text-base font-normal text-primary mr-2">
                        {selectedItem.label} x{quantity}
                      </span>
                      <span className="block text-xl font-bold text-primary">
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
                  <h3 className="font-pixel text-xl text-primary tracking-tighter mt-2">
                    Choose Payment Method
                  </h3>
                </div>

                {/* Payment Methods Grid */}
                <div className="p-4">
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
                                  Payment Instructions
                                </h5>

                                <ol className="space-y-3 text-sm">
                                  {method.instructions.map((instruction, idx) => (
                                    <li key={idx} className="flex gap-3">
                                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                      <span
                                        className="text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                          __html: instruction,
                                        }}
                                      />
                                    </li>
                                  ))}
                                </ol>

                                <div className="space-y-4">
                                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                                    <div className="flex items-center justify-between">
                                      <span className="font-pixel text-sm text-primary">
                                        {method.name} Number
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(method.account, "Account")
                                        }
                                        className="text-primary hover:text-primary/80 font-pixel text-xs px-2 py-1 rounded border border-primary/20 hover:bg-primary/10 transition-colors"
                                      >
                                        {copiedText === "Account" ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                    <div className="font-mono text-lg font-bold text-primary mt-1">
                                      {method.account}
                                    </div>
                                  </div>

                                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex items-center justify-between">
                                      <span className="font-pixel text-sm text-green-700">
                                        Amount to Send
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(String(totalAmount), "Amount")
                                        }
                                        className="text-green-700 hover:text-green-600 font-pixel text-xs px-2 py-1 rounded border border-green-300 hover:bg-green-100 transition-colors"
                                      >
                                        {copiedText === "Amount" ? "Copied!" : "Copy"}
                                      </button>
                                    </div>
                                    <div className="font-mono text-xl font-bold text-green-700 mt-1">
                                      {totalAmount}৳
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium mb-1">Important:</p>
                                    <p>
                                      Send the exact amount shown above. Any
                                      difference may delay your order processing.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* QR Code and Form */}
                              <div className="">
                                <h5 className="font-pixel text-base text-primary mb-4">
                                  Payment Details
                                </h5>
                                <div className="text-center mb-6">
                                  <img
                                    src={method.qr}
                                    alt={`${method.name} QR`}
                                    className="w-64 h-64 mx-auto rounded-xl"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    Scan QR code to pay with {method.name}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="font-pixel text-sm text-primary mb-2 block">
                                      Your {method.name} Account Number
                                    </label>
                                    <input
                                      type="text"
                                      value={userAccount}
                                      onChange={(e) => setUserAccount(e.target.value)}
                                      placeholder={`Enter your ${method.name} account number`}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="font-pixel text-sm text-primary mb-2 block">
                                      Transaction ID (TRX ID)
                                    </label>
                                    <input
                                      type="text"
                                      value={trxId}
                                      onChange={(e) => setTrxId(e.target.value)}
                                      placeholder="Enter transaction ID from SMS"
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                      required
                                    />
                                  </div>

                                  <Button
                                    onClick={handleCompletePayment}
                                    disabled={
                                      !paymentMethod ||
                                      !userAccount ||
                                      !trxId ||
                                      isProcessingOrder
                                    }
                                    className="w-full font-pixel text-lg py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                  >
                                    {isProcessingOrder ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                      </div>
                                    ) : (
                                      "Complete Payment"
                                    )}
                                  </Button>

                                  <button
                                    type="button"
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-2 text-gray-600 hover:text-gray-800 font-pixel text-sm transition-colors"
                                  >
                                    Cancel Payment
                                  </button>
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

export default AiToolDetailsLayout;
