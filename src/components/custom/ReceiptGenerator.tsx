import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '../ui/button';
import { OrderData } from '../../lib/orders';
import { 
  Download, 
  Printer
} from 'lucide-react';

interface ReceiptGeneratorProps {
  order: OrderData;
  userName?: string;
  userEmail?: string;
}

interface DownloadRef {
  download: () => Promise<void>;
}

const ReceiptGenerator = forwardRef<DownloadRef, ReceiptGeneratorProps>(
  ({ order, userName = "Guest User", userEmail = "guest@example.com" }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    try {
      // Wait a bit for any dynamic content to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate canvas from the receipt content
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 600,
        height: 800,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with A4 size
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit on A4 page with margins
      const margin = 20;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calculate scaling to fit the content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583));
      
      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;
      
      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Add footer text
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated from onedigitalspot.com', margin, pdfHeight - 10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pdfHeight - 6);
      
      // Save the PDF using a blob download to avoid internal document.write fallbacks
      const fileName = `Receipt-${order.orderID || order.transactionId?.slice(-8) || 'Order'}.pdf`;
      try {
        // preferred: get blob and download via object URL
        const blob = pdf.output && typeof pdf.output === 'function' ? (pdf.output('blob') as Blob) : null;
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          // fallback to library save
          (pdf as any).save(fileName);
        }
      } catch (err) {
        // fallback to library save if any error occurs
        try {
          (pdf as any).save(fileName);
        } catch (e) {
          console.error('Failed to download PDF:', e);
          throw e;
        }
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // expose download method to parent via ref
  useImperativeHandle(ref, () => ({
    download: handleDownloadPDF,
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ReceiptContent = () => (
    <div ref={receiptRef}>
      <style>
        {`
          .receipt-container {
            background-color: white;
            width: 600px;
            -top: 20;
            font-family: 'Arial', sans-serif;
            color: #333;
            border: 1px solid #e0e0e0;
            margin: 0 auto;
          }
          
          .receipt-header {
            text-align: center;
            border-bottom: 2px solid #eee;
          }
          
          .receipt-header img {
            width: 150px;
            height: auto;
            margin: 0 auto 15px;
            display: block;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 5px;
          }
          
          .website {
            color: #666;
            font-size: 14px;
          }
          
          .receipt-title {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          
          .receipt-title h2 {
            font-size: 22px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0 0 10px 0;
          }
          
          .receipt-title p {
            color: #666;
            margin: 0;
          }
          
          .info-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          
          .info-row:last-child {
            margin-bottom: 0;
          }
          
          .info-label {
            font-weight: 600;
            color: #666;
          }
          
          .info-value {
            text-align: right;
            color: #333;
          }
          
          .status-badge {
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 500;
            font-size: 12px;
          }
          
          .product-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .product-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .product-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 15px;
          }
          
          .product-details h4 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #1a1a1a;
          }
          
          .product-details p {
            color: #666;
            font-size: 14px;
            margin: 0;
          }
          
          .game-info {
            margin-bottom: 20px;
          }
          
          .price-section {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 20px;
          }
          
          .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          
          .price-row:last-child {
            margin-bottom: 0;
          }
          
          .total-row {
            border-top: 2px solid #ddd;
            margin-top: 15px;
            padding-top: 15px;
            font-weight: bold;
            font-size: 16px;
          }
          
          .total-amount {
            color: #1976d2;
            font-weight: bold;
          }
          
          .receipt-footer {
            margin-top: 40px;
            padding: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          .receipt-footer p {
            margin: 5px 0;
          }
        `}
      </style>
      
      <div className="receipt-container">
        {/* Header */}
        <div className="receipt-header">
          <img 
            src="/assets/logo.svg" 
            alt="1 Digital Spot"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Receipt Title */}
        <div className="receipt-title">
          <h2>PURCHASE RECEIPT</h2>
          <p>Thank you for your purchase!</p>
        </div>

        {/* Order Information */}
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Order ID:</span>
            <span className="info-value">{order.orderID || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Transaction ID:</span>
            <span className="info-value">{order.transactionId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date & Time:</span>
            <span className="info-value">{formatDate(order.createdAt)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="status-badge">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Customer Name:</span>
            <span className="info-value">{userName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email Address:</span>
            <span className="info-value">{userEmail}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-section">
          <div className="product-header">
            <img 
              src={order.productImage} 
              alt={order.productName}
              className="product-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='40' y='44' text-anchor='middle' font-family='Arial' font-size='12' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
            <div className="product-details">
              <h4>{order.productName}</h4>
              <p>{order.itemLabel}</p>
            </div>
          </div>

          {/* Game Information */}
          {(order.playerId || order.zoneId) && (
            <div className="game-info">
              {order.playerId && (
                <div className="info-row">
                  <span className="info-label">Player ID:</span>
                  <span className="info-value">{order.playerId}</span>
                </div>
              )}
              {order.zoneId && (
                <div className="info-row">
                  <span className="info-label">Zone ID:</span>
                  <span className="info-value">{order.zoneId}</span>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown */}
          <div className="price-section">
            <div className="price-row">
              <span>Unit Price:</span>
              <span>{order.unitPrice}৳</span>
            </div>
            <div className="price-row">
              <span>Quantity:</span>
              <span>{order.quantity}</span>
            </div>
            <div className="price-row">
              <span>Payment Method:</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="price-row total-row">
              <span>Total Amount:</span>
              <span className="total-amount">{order.totalAmount}৳</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>For support, please contact us at support@onedigitalspot.com</p>
          <p>Generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Hidden Receipt Content for PDF Generation */}
      <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
        <ReceiptContent />
      </div>
      
    </>
  );
  });

export default ReceiptGenerator;