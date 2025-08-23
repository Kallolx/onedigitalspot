import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ServiceCard from "@/components/custom/ServiceCard";
import OrderStatusModal from "@/components/custom/OrderStatusModal";
import React, { useState, useEffect, useRef } from "react";
import { Info, X, ArrowLeft } from "lucide-react";
import { LockKeyIcon, SentIcon, ShoppingCart02Icon } from "hugeicons-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/components/ui/sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import Footer from "../landing/Footer";
import { Input } from "../ui/input";

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
  playerIdLabel?: string; // Custom label for player ID field (e.g., "UUID" for Genshin Impact)
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
  playerIdLabel = "Player ID", // default label
}) => {
  const [showInfo, setShowInfo] = useState<null | "player" | "zone" | "uuid">(
    null
  );
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
    window.scrollTo({ top: 10, left: 0, behavior: "auto" });
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
      <main className="container mx-auto px-4 py-8">
        <div className="relative mb-6">
          {/* Back button (rounded ghost) placed left; title stays centered */}
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent border hover:bg-muted/60 rounded-full p-2"
          >
            <span className="sr-only">Go back</span>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center font-pixel text-foreground">
            Purchase {title}
          </h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Game Image Section - Compact */}
          <div className="lg:col-span-4">
            <div className="bg-background border rounded-2xl p-4 sticky top-32">
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
            <Card className="mb-6 p-4 bg-transparent order-1 lg:order-0">
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
            <Card className="mb-8 p-4 bg-transparent order-0 lg:order-1">
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
                            {playerIdLabel} <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <Input
                              id="playerId"
                              className="h-12"
                              placeholder={`Enter your ${playerIdLabel}`}
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
                              aria-label={`Where to find ${playerIdLabel}`}
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                        {showInfo === "player" ? playerIdLabel : showInfo === "zone" ? "Zone ID" : "UUID"}?
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

                {/* Order Summary */}
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

                {/* Total */}
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
                        // Prepare checkout data
                        const checkoutItems = selectedItems.map(
                          (selectedItem) => {
                            const item =
                              priceList[selectedItem.categoryIdx]?.items[
                                selectedItem.itemIdx
                              ];
                            return {
                              categoryIdx: selectedItem.categoryIdx,
                              itemIdx: selectedItem.itemIdx,
                              quantity: selectedItem.quantity,
                              label: item?.label || "",
                              price:
                                typeof item?.price === "number"
                                  ? item.price
                                  : 0,
                              productName: title,
                              productImage: image,
                              productType: "Games", // Adjust based on URL or product type
                            };
                          }
                        );

                        const checkoutData = {
                          items: checkoutItems,
                          gameInfo: {
                            playerId,
                            zoneId,
                          },
                          productDetails: {
                            name: title,
                            image: image,
                            type: "Games",
                          },
                        };

                        // Navigate to checkout with data
                        navigate("/checkout", { state: { checkoutData } });
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
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-44 font-pixel text-base sm:text-lg flex items-center justify-center"
                    disabled={
                      selectedItems.length === 0 ||
                      (typeof playerId !== "undefined" && !playerId) ||
                      (typeof zoneId !== "undefined" && !zoneId)
                    }
                      onClick={() => {
                        // convert selectedItems to cart items with game info
                          selectedItems.forEach((si) => {
                          const item = priceList[si.categoryIdx]?.items[si.itemIdx];
                          if (!item) return;
                          addItem({
                            productName: title,
                            productImage: image,
                            label: item.label,
                            price: typeof item.price === "number" ? item.price : 0,
                            quantity: si.quantity,
                            productType: "Games",
                            gameInfo: {
                              playerId,
                              zoneId,
                            },
                          });
                        });
                          setOpen(true);
                          // Build a short summary for the toast
                          const addedSummary = selectedItems
                            .map((si) => {
                              const it = priceList[si.categoryIdx]?.items[si.itemIdx];
                              if (!it) return null;
                              return `${it.label}${si.quantity && si.quantity > 1 ? ` x${si.quantity}` : ""}`;
                            })
                            .filter(Boolean)
                            .slice(0, 3)
                            .join(", ");

                          const moreCount = Math.max(0, selectedItems.length - 3);
                          const message = `${addedSummary}${moreCount > 0 ? ` and ${moreCount} more` : ""} added to cart`;
                          toast.success(message);
                      }}
                  >
                    <ShoppingCart02Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    Add to Cart
                  </Button>
                </div>
              </form>
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
        orderData={orderModal.orderData}
        onViewOrders={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          navigate("/my-orders");
        }}
        onRetry={() => {
          setOrderModal({ ...orderModal, isOpen: false });
          // Reset is now handled in the checkout page
        }}
      />
      <Footer />
    </div>
  );
};

export default GameDetailsLayout;
