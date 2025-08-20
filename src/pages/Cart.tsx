import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  CreditCard,
  ShoppingBag
} from "lucide-react";

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToCheckout = () => {
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

    const gameInfoItems = items.filter(item => 
      item.gameInfo && 
      (item.gameInfo.playerId || item.gameInfo.zoneId || item.gameInfo.uuid)
    );
    
    const gameInfo = gameInfoItems.length > 0 
      ? gameInfoItems.find(item => 
          item.gameInfo?.playerId && 
          item.gameInfo?.zoneId
        )?.gameInfo || gameInfoItems[0]?.gameInfo
      : undefined;

    const checkoutData = {
      items: checkoutItems,
      gameInfo: gameInfo,
      productDetails: {
        name: checkoutItems.length === 1 ? checkoutItems[0].productName : "Cart",
        image: checkoutItems[0]?.productImage || "/assets/placeholder.svg",
        type: checkoutItems[0]?.productType || "Products",
      },
    };

    navigate("/checkout", { state: { checkoutData } });
  };

  const CartSummary = ({ className = "" }: { className?: string }) => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
            <span className="font-medium">৳{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <div className="text-right">
              {deliveryFee === 0 ? (
                <div className="space-y-1">
                  <span className="text-green-600 font-medium">Free</span>
                  <div className="text-xs text-green-600">Orders over ৳500</div>
                </div>
              ) : (
                <span className="font-medium">৳{deliveryFee}</span>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>৳{total.toLocaleString()}</span>
          </div>
        </div>

        <Button 
          onClick={goToCheckout} 
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Proceed to Checkout
        </Button>

        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="w-full"
        >
          Continue Shopping
        </Button>

        {deliveryFee > 0 && (
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Add ৳{(500 - subtotal).toLocaleString()} more for free delivery!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
      </p>
      <Button 
        onClick={() => navigate("/")}
        size="lg"
        className="px-8"
      >
        <ShoppingBag className="w-4 h-4 mr-2" />
        Start Shopping
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Shopping Cart</h1>
              {items.length > 0 && (
                <Badge variant="secondary" className="px-2 py-1">
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items - Left Side on Desktop */}
            <div className="lg:col-span-8">
              <div className="space-y-4 mb-6 lg:mb-0">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
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
                            <div>
                              <h3 className="font-semibold text-gray-900 line-clamp-2 pr-2">
                                {item.productName}
                              </h3>
                              {item.label && (
                                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Game Info Display */}
                          {item.gameInfo && (item.gameInfo.playerId || item.gameInfo.zoneId || item.gameInfo.uuid) && (
                            <div className="space-y-1 mb-3">
                              {item.gameInfo.playerId && (
                                <Badge variant="outline" className="text-xs mr-2">
                                  Player id: {item.gameInfo.playerId}
                                </Badge>
                              )}
                              {item.gameInfo.zoneId && (
                                <Badge variant="outline" className="text-xs mr-2">
                                  Zone id: {item.gameInfo.zoneId}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Price and Quantity Controls */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                ৳{(item.price * item.quantity).toLocaleString()}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-sm text-muted-foreground">
                                  ৳{item.price.toLocaleString()} each
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

          {/* Mobile Sticky Summary */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">৳{total.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{totalItems} items</div>
                </div>
                <Button onClick={goToCheckout} size="lg" className="px-8">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Checkout
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile bottom padding to prevent content overlap */}
          <div className="lg:hidden h-24"></div>
        </div>
      )}
    </div>
  );
};

export default CartPage;