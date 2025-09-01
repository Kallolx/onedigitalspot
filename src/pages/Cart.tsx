import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation } from "react-router-dom";
import { account } from "@/lib/appwrite";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import Footer from "@/components/landing/Footer";
import { MasterCardIcon, ShoppingBag02Icon } from "hugeicons-react";

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignedIn, setIsSignedIn] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let mounted = true;
    account
      .get()
      .then(() => mounted && setIsSignedIn(true))
      .catch(() => mounted && setIsSignedIn(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Utility to convert English digits to Bangla digits
  const toBanglaNumber = (num: string | number) => {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    // Accept numbers or formatted number strings (e.g. "1,234")
    const cleaned = String(num).replace(/,/g, "");
    const n = Number(cleaned);
    if (Number.isNaN(n)) {
      // fallback: return the original input as string (unchanged)
      return String(num);
    }
    const formatted = n.toLocaleString("en-IN");
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  };

  const goToCheckout = () => {
    const checkoutData = buildCheckoutData();
    navigate("/checkout", { state: { checkoutData } });
  };

  // Build checkout payload from cart items (used for direct checkout and for saving before redirect)
  const buildCheckoutData = () => {
    const checkoutItems = items.map((item) => ({
      categoryIdx: 0,
      itemIdx: 0,
      quantity: item.quantity,
      label: item.label || item.productName,
      price: item.price,
      productName: item.productName,
      productImage: item.productImage || "",
      productType: item.productType || "Products",
    }));

    const gameInfoItems = items.filter(
      (item) =>
        item.gameInfo &&
        (item.gameInfo.playerId || item.gameInfo.zoneId || item.gameInfo.uuid)
    );

    const gameInfo =
      gameInfoItems.length > 0
        ? gameInfoItems.find(
            (item) => item.gameInfo?.playerId && item.gameInfo?.zoneId
          )?.gameInfo || gameInfoItems[0]?.gameInfo
        : undefined;

    const checkoutData = {
      items: checkoutItems,
      gameInfo: gameInfo,
      productDetails: {
        name:
          checkoutItems.length === 1 ? checkoutItems[0].productName : "Cart",
        image: checkoutItems[0]?.productImage || "/assets/placeholder.svg",
        type: checkoutItems[0]?.productType || "Products",
      },
      isCartCheckout: true,
    };

    return checkoutData;
  };

  const handleCheckoutClick = () => {
    if (isSignedIn) {
      goToCheckout();
      return;
    }

    try {
      const cd = buildCheckoutData();
      localStorage.setItem("checkoutData", JSON.stringify(cd));
    } catch (e) {
      console.warn("Could not persist checkout data before redirect:", e);
    }

    // Redirect user to login, then to /checkout where saved data will be read
    navigate(`/auth/login?redirect=${encodeURIComponent("/checkout")}`);
  };

  const CartSummary = ({ className = "" }: { className?: string }) => (
    <Card className={`bg-background ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-muted-foreground">
              Subtotal ({totalItems} items)
            </div>
            {/* List each product: name on left, line price (price * qty) on right */}
            <div className="space-y-1">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="max-w-[180px] text-md truncate">
                    {it.productName}
                  </div>
                  <div className="text-right font-anekbangla text-md font-bold">
                    ৳{toBanglaNumber(it.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-xl font-anekbangla text-secondary">
              ৳{toBanglaNumber(total)} টাকা{" "}
            </span>
          </div>
        </div>

        <Button
          onClick={handleCheckoutClick}
          className="w-full h-12 font-semibold"
          size="lg"
        >
          {isSignedIn ? (
            <>
              <MasterCardIcon className="w-8 h-8" />
              Proceed to Checkout
            </>
          ) : (
            <>
              <span className="hidden lg:inline">Login to Continue</span>
              <span className="inline lg:hidden">Login</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full"
        >
          <ShoppingBag02Icon className="w-8 h-8" />
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );

  // If cart is empty
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-start justify-center px-4 pt-12 md:pt-20">
        <div className="max-w-md w-full border rounded-lg p-8 text-center">
          <img
            src="/assets/icons/others/empty.svg"
            alt="Empty cart"
            className="mx-auto h-24 mb-6"
          />
          <h1 className="text-2xl font-semibold text-gray-900">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mt-2">
            Looks like you haven't added anything to your cart yet. Start
            shopping to fill it up!
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button onClick={() => navigate("/")} className="px-4 py-2">
              Shop Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/all-products")}
              className="px-4 py-2"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
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
              <h1 className="text-2xl font-bold font-pixel text-foreground">
                Your Cart
              </h1>
              <p className="text-gray-600 mt-1 hidden md:block">
                Review your order and complete payment
              </p>
            </div>
            <div className="w-20 flex items-center justify-end"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mt-0 md:mt-4 mb-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items - Left Side on Desktop */}
          <div className="lg:col-span-8">
            <div className="space-y-4 mb-6 lg:mb-0">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden bg-background">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <img
                          src={item.productImage || "/assets/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full rounded-lg object-cover bg-gray-100"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start">
                            <div>
                              <h3
                                className="font-bold text-xl text-secondary m-0 leading-tight truncate whitespace-nowrap max-w-full"
                                title={item.productName}
                              >
                                {item.productName}
                              </h3>
                              {item.label && (
                                <p className="text-sm text-muted-foreground mt-0">
                                  {item.label}
                                </p>
                              )}
                            </div>

                            {/* Desktop: show game badges beside title (align to top to avoid gap) */}
                            {item.gameInfo &&
                              (item.gameInfo.playerId ||
                                item.gameInfo.zoneId) && (
                                <div className="hidden md:flex md:items-start md:gap-2 md:ml-3">
                                  {item.gameInfo.playerId && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Player id: {item.gameInfo.playerId}
                                    </Badge>
                                  )}
                                  {item.gameInfo.zoneId && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Zone id: {item.gameInfo.zoneId}
                                    </Badge>
                                  )}
                                </div>
                              )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Game Info Display - mobile (kept as before, hidden on md+) */}
                        {item.gameInfo &&
                          (item.gameInfo.playerId || item.gameInfo.zoneId) && (
                            <div className="space-y-1 mb-3 md:hidden">
                              {item.gameInfo.playerId && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mr-2"
                                >
                                  Player id: {item.gameInfo.playerId}
                                </Badge>
                              )}
                              {item.gameInfo.zoneId && (
                                <Badge
                                  variant="outline"
                                  className="text-xs mr-2"
                                >
                                  Zone id: {item.gameInfo.zoneId}
                                </Badge>
                              )}
                            </div>
                          )}

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button
                              type="button"
                              className="w-7 h-7 sm:w-8 sm:h-8 border rounded-full flex items-center justify-center hover:bg-primary transition-colors text-md"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
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
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-bold font-anekbangla text-xl">
                              <span className="text-secondary">৳</span>
                              {toBanglaNumber(item.price * item.quantity)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-muted-foreground">
                                ৳<span className="font-bold">{item.price}</span>{" "}
                                each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary - Right Side on Desktop, Sticky Bottom on Mobile */}
          <div className="lg:col-span-4">
            {/* Desktop Summary */}
            <CartSummary className="hidden lg:block sticky top-24" />
          </div>
        </div>

        {/* Mobile Sticky Summary - Styled to match Checkout */}
        <div className="lg:hidden">
          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t z-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </div>
                <div className="text-xl text-secondary font-anekbangla font-bold">
                  ৳{toBanglaNumber(total)} টাকা
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCheckoutClick}
                  className="h-10"
                  size="lg"
                >
                  {isSignedIn ? (
                    <>
                      <MasterCardIcon className="w-8 h-8" />
                      Checkout
                    </>
                  ) : (
                    <span>Login to continue</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile bottom padding to prevent content overlap */}
          <div className="h-20" />
        </div>
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default CartPage;
