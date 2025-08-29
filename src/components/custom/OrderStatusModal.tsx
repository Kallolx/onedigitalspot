import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";

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
  const navigate = useNavigate();
  const isSuccess = status === "success";

  const defaultTitle = isSuccess
    ? "Order Placed Successfully!"
    : "Order Failed";
  const defaultMessage = isSuccess
    ? "Your order has been successfully placed and is being processed."
    : "There was an issue processing your order. Please try again.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="relative p-6">
          {/* Icon */}
          <div className="mb-6 mt-4">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isSuccess
                  ? "bg-green-100 border-2 border-green-200"
                  : "bg-red-100 border-2 border-destructive"
              }`}
            >
              {isSuccess ? (
                <CheckCircleIcon className="w-10 h-10 text-secondary" />
              ) : (
                <XCircleIcon className="w-10 h-10 text-red-600" />
              )}
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-2xl font-bold text-center mb-2 font-pixel">
            {title || defaultTitle}
          </DialogTitle>

          {/* Message */}
          <DialogDescription className="text-center text-gray-600 mb-6 leading-relaxed">
            {message || defaultMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Order Details (Success only) */}
        {isSuccess && orderData && (
          <div className="bg-gray-50 rounded-xl p-4 mx-6 mb-6 text-left">
            <h3 className="font-pixel text-sm text-secondary mb-3 uppercase tracking-wide">
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              {orderData.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-sans font-bold text-md text-secondary">
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
                  <span className="font-mono text-md">
                    {orderData.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="flex flex-col gap-3 px-6 pb-6">
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
                className="w-full font-pixel"
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
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
              <DialogClose asChild>
                <Button variant="outline" className="w-full font-pixel">
                  Close
                </Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusModal;
