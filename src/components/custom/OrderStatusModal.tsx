import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, RefreshCwIcon, XIcon } from "lucide-react";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "error";
  title?: string;
  message?: string;
  orderData?: {
    orderId?: string;
    amount?: number;
    productName?: string;
    transactionId?: string;
  };
  onViewOrders?: () => void;
  onRetry?: () => void;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  title,
  message,
  orderData,
  onViewOrders,
  onRetry,
}) => {
  if (!isOpen) return null;

  const isSuccess = status === "success";

  const defaultTitle = isSuccess ? "Order Placed Successfully!" : "Order Failed";
  const defaultMessage = isSuccess
    ? "Your order has been successfully placed and is being processed."
    : "There was an issue processing your order. Please try again.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg p-4">
      <Card className="w-full max-w-md bg-background rounded-2xl shadow-retro border-2 border-primary/20 overflow-hidden">
      {/* Close Icon */}
          <button
            onClick={onClose}
            className="absolute top-10 right-10 text-secondary hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isSuccess
                  ? "bg-green-100 border-2 border-green-200"
                  : "bg-red-100 border-2 border-red-200"
              }`}
            >
              {isSuccess ? (
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-red-600" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 font-pixel mb-2">
            {title || defaultTitle}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message || defaultMessage}
          </p>

          {/* Order Details (Success only) */}
          {isSuccess && orderData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-pixel text-sm text-secondary mb-3 uppercase tracking-wide">
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                {orderData.orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="font-mono font-medium">
                      {orderData.orderId}
                    </span>
                  </div>
                )}
                {orderData.productName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product:</span>
                    <span className="font-medium">{orderData.productName}</span>
                  </div>
                )}
                {orderData.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-secondary font-pixel">
                      {orderData.amount}৳
                    </span>
                  </div>
                )}
                {orderData.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono text-xs">
                      {orderData.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {isSuccess ? (
              <>
                {onViewOrders && (
                  <Button
                    onClick={onViewOrders}
                    className="w-full font-pixel flex items-center justify-center gap-2"
                  >
                    View My Orders
                    <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full font-pixel"
                >
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    className="w-full font-pixel flex items-center justify-center gap-2"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full font-pixel"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderStatusModal;
