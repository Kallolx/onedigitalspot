import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState, useRef } from "react";
import ServiceCard from "@/components/custom/ServiceCard";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Send,
} from "lucide-react";
import { RotateLoader } from "react-spinners";
import { account } from "@/lib/appwrite";
import { getCurrentUser } from "@/lib/orders";
import OrderStatusModal from "@/components/custom/OrderStatusModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ShoppingCart02Icon } from "hugeicons-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/ui/sonner";

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

interface AiToolDetailsLayoutProps {
  title: string;
  image: string;
  priceList: PriceCategory[];
  infoSections: InfoSection[];
  similarProducts: any[];
  selectedItems?: SelectedItem[];
  setSelectedItems?: (v: SelectedItem[]) => void;
  children?: React.ReactNode;
  isSignedIn?: boolean;
}

const AiToolDetailsLayout: React.FC<AiToolDetailsLayoutProps> = ({
  title,
  image,
  priceList,
  infoSections,
  similarProducts,
  selectedItems: propSelectedItems,
  setSelectedItems: propSetSelectedItems,
  children,
  isSignedIn = false,
}) => {
  // Local state for selected items if not provided as props
  const [localSelectedItems, setLocalSelectedItems] = useState<SelectedItem[]>(
    []
  );

  // Use props if available, otherwise use local state
  const selectedItems = propSelectedItems || localSelectedItems;
  const setSelectedItems = propSetSelectedItems || setLocalSelectedItems;

  const [purchaseType, setPurchaseType] = useState<"shared" | "personal">(
    "shared"
  );
  const [personalType, setPersonalType] = useState<"existing" | "new">("new");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Order states
  const [copiedText, setCopiedText] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
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
  const { addItem, setOpen } = useCart();

  // Calculate total amount from all selected items
  const totalAmount = selectedItems.reduce((total, item) => {
    const selectedItem = priceList[item.categoryIdx]?.items[item.itemIdx];
    if (!selectedItem) return total;

    const itemPrice =
      typeof selectedItem.price === "number" ? selectedItem.price : 0;
    return total + itemPrice * item.quantity;
  }, 0);

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

  // Remove item completely
  const removeItem = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
  };

  // Determine if this is a subscription product based on URL
  const isSubscription = location.pathname.includes("/subscriptions/");

  // Calculate selected item and total amount - No longer needed with multiple selection
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

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Handle order creation - updated to use checkout flow like game layout
  const handleCompletePayment = async () => {
    if (selectedItems.length === 0) {
      setOrderModal({
        isOpen: true,
        status: "error",
        title: "No Items Selected",
        message: "Please select at least one item before proceeding.",
      });
      return;
    }

    // Navigate to checkout with data like game layout
    const checkoutItems = selectedItems.map((selectedItem) => {
      const item =
        priceList[selectedItem.categoryIdx]?.items[selectedItem.itemIdx];
      return {
        categoryIdx: selectedItem.categoryIdx,
        itemIdx: selectedItem.itemIdx,
        quantity: selectedItem.quantity,
        label: item?.label || "",
        price: typeof item?.price === "number" ? item.price : 0,
        productName: title,
        productImage: image,
        productType: isSubscription ? "Subscriptions" : "AI Tools",
      };
    });

    const checkoutData = {
      items: checkoutItems,
      gameInfo: {
        playerId: personalType === "existing" ? email : "",
        zoneId: personalType === "existing" ? password : "",
      },
      productDetails: {
        name: title,
        image: image,
        type: isSubscription ? "Subscriptions" : "AI Tools",
      },
    };

    // Navigate to checkout with data
    navigate("/checkout", { state: { checkoutData } });
  };

  // Payment methods configuration - removed as we now use checkout flow

  // Always scroll to top when this layout mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  // Load saved inputs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aiToolOrderInputs");
    if (saved) {
      const { selectedItems, purchaseType, personalType, email, pathname } =
        JSON.parse(saved);
      if (selectedItems) setSelectedItems(selectedItems);
      if (purchaseType) setPurchaseType(purchaseType);
      if (personalType) setPersonalType(personalType);
      if (email) setEmail(email);
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
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-6 font-pixel text-foreground">
          Purchase {title}
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Section */}
          <div className="lg:col-span-4">
            <div className="bg-background border rounded-2xl p-6 sticky top-32">
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
              <Card className="mb-6 p-4 bg-background">
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
                    variant={
                      purchaseType === "personal" ? "default" : "outline"
                    }
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
                      .map((category, filteredIdx) => {
                        // Find the original index in the full priceList
                        const originalCatIdx = priceList.findIndex(
                          (cat) => cat.title === category.title
                        );
                        return (
                          <div key={filteredIdx}>
                            <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80 flex items-center gap-2">
                              {category.title}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {category.items.map((item, itemIdx) => (
                                <Button
                                  key={itemIdx}
                                  type="button"
                                  variant={
                                    isItemSelected(originalCatIdx, itemIdx)
                                      ? "default"
                                      : "ghost"
                                  }
                                  className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                                  onClick={() =>
                                    handleItemSelection(originalCatIdx, itemIdx)
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
                                    <span className="block whitespace-normal" title={item.label}>
                                      {item.label}
                                    </span>
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
                                      isItemSelected(originalCatIdx, itemIdx)
                                        ? "text-foreground"
                                        : "text-secondary"
                                    }`}
                                  >
                                    ৳{toBanglaNumber(item.price)}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
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
                              personalType === "new" ? "default" : "outline"
                            }
                            onClick={() => {
                              // Switch to personal->new sub-tab (do not switch back to shared)
                              setPersonalType("new");
                              setSelectedItems([]);
                            }}
                            className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                          >
                            Receive New Account
                          </Button>
                          <Button
                            type="button"
                            variant={
                              personalType === "existing"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              setPersonalType("existing");
                              setSelectedItems([]);
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
                          .map((category, filteredIdx) => {
                            // Find the original index in the full priceList
                            const originalCatIdx = priceList.findIndex(
                              (cat) => cat.title === category.title
                            );
                            return (
                              <div key={filteredIdx}>
                                <h3 className="font-pixel text-base text-foreground mb-2 pl-1 opacity-80 flex items-center gap-2">
                                  {category.title}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {category.items.map((item, itemIdx) => (
                                    <Button
                                      key={itemIdx}
                                      type="button"
                                      variant={
                                        isItemSelected(originalCatIdx, itemIdx)
                                          ? "default"
                                          : "ghost"
                                      }
                                      className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                                      onClick={() =>
                                        handleItemSelection(
                                          originalCatIdx,
                                          itemIdx
                                        )
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
                                        <span className="block whitespace-normal" title={item.label}>
                                          {item.label}
                                        </span>
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
                                          isItemSelected(
                                            originalCatIdx,
                                            itemIdx
                                          )
                                            ? "text-foreground"
                                            : "text-secondary"
                                        }`}
                                      >
                                        ৳{toBanglaNumber(item.price)}
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      {/* Account details form only for AI tools with existing account */}
                      {!isSubscription && personalType === "existing" && (
                        <div className="flex flex-col gap-3">
                          <label className="font-pixel text-base text-foreground">
                            Provide your {title.split(" ")[0] || ""} details
                          </label>
                          <input
                            className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-background focus:border-foreground focus:outline-none transition"
                            placeholder={`Enter your ${(
                              title.split(" ")[0] || ""
                            ).toLowerCase()} email`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <input
                            className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-background focus:border-foreground focus:outline-none transition"
                            placeholder={`Enter your ${(
                              title.split(" ")[0] || ""
                            ).toLowerCase()} password`}
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
              <Card className="mb-6 p-4 bg-background">
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
                                  className="w-5 h-5 text-foreground"
                                />
                              )}
                              <span className="block whitespace-normal" title={item.label}>
                                {item.label}
                              </span>
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
                                isItemSelected(catIdx, itemIdx)
                                  ? "text-foreground"
                                  : "text-secondary"
                              }`}
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
            )}

            {/* Multiple Items Display and Order Summary */}
            <Card className="mb-8 p-4 bg-background">
              {selectedItems.length > 0 && (
                <div className="mb-4">
                  <span className="font-sans text-lg text-foreground font-medium">
                    Order Summary
                  </span>
                  <div className="space-y-2 max-h-40 mt-2 overflow-y-auto">
                    {selectedItems.map((selectedItem, index) => {
                      const item =
                        priceList[selectedItem.categoryIdx]?.items[
                          selectedItem.itemIdx
                        ];
                      if (!item) return null;

                      return (
                        <div
                          key={index}
                          className="flex items-center border justify-between rounded-lg p-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900 ml-2 whitespace-normal">
                                <span className="w-auto" title={item.label}>
                                  {item.label}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              type="button"
                              className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-primary transition-colors text-md"
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
                              className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-primary transition-colors text-md"
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedItems.length > 0 && (
                <div className="rounded-xl border bg-muted px-4 py-3 mb-3 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-pixel text-lg text-foreground font-bold">
                        Total
                      </span>
                      <span className="flex gap-2 font-anekbangla text-2xl text-foreground font-bold">
                        ৳ {toBanglaNumber(totalAmount)} টাকা
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
                          selectedItems,
                          purchaseType,
                          personalType,
                          email,
                          pathname: location.pathname,
                        })
                      );
                      navigate(
                        `/auth/login?redirect=${encodeURIComponent(
                          location.pathname
                        )}`
                      );
                    } else {
                      handleCompletePayment();
                    }
                  }}
                >
                  {!isSignedIn ? (
                    <>
                      <Lock
                        className="w-6 h-6 sm:w-7 sm:h-7 mr-2"
                        strokeWidth={3}
                      />
                      Please Login to Continue
                    </>
                  ) : (
                    <>
                      <Send
                        className="w-6 h-6 sm:w-7 sm:h-7 ml-2"
                        strokeWidth={3}
                      />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-44 font-pixel text-base sm:text-lg flex items-center justify-center"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    // add all selected items to cart
                    selectedItems.forEach((si) => {
                      const item = priceList[si.categoryIdx]?.items[si.itemIdx];
                      if (!item) return;
                      addItem({
                        productName: title,
                        productImage: image,
                        label: item.label,
                        price: typeof item.price === "number" ? item.price : 0,
                        quantity: si.quantity,
                        productType: isSubscription ? "Subscriptions" : "AI Tools",
                      });
                    });

                    // Toast summary for added items (show up to 3 items)
                    const summaryItems = selectedItems
                      .slice(0, 3)
                      .map((si) => {
                        const it = priceList[si.categoryIdx]?.items[si.itemIdx];
                        return it ? `${si.quantity} x ${it.label}` : null;
                      })
                      .filter(Boolean) as string[];
                    const remaining = selectedItems.length - summaryItems.length;
                    const message = summaryItems.length
                      ? `${summaryItems.join(", ")}${
                          remaining > 0 ? ` and ${remaining} more` : ""
                        } added to cart`
                      : "Item added to cart";

                    toast.success(message);
                    setOpen(true);
                  }}
                >
                  <ShoppingCart02Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  Add to Cart
                </Button>
              </div>
            </Card>

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
          setSelectedItems([]);
        }}
      />
    </div>
  );
};

export default AiToolDetailsLayout;
