import React, { useEffect, useState } from 'react';
import { 
  Receipt as ReceiptIcon, 
  Printer, 
  Download, 
  X,
  Calendar,
  User,
  CreditCard,
  Package,
  Check,
  Settings
} from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

const Receipt = ({ 
  sale, 
  onClose, 
  onPrint,
  autoPrint = false,
  autoClose = false 
}) => {
  const [printSettings, setPrintSettings] = useState({
    autoPrint: false,
    autoClose: false,
    copies: 1
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const { format: formatPrice } = useCurrency();
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePrint = async (copies = 1) => {
    setIsPrinting(true);
    
    try {
      // Print the specified number of copies
      for (let i = 0; i < copies; i++) {
        await new Promise(resolve => {
          window.print();
          // Small delay between prints
          setTimeout(resolve, 500);
        });
      }
      
      if (onPrint) onPrint();
      
      // Auto-close if enabled
      if (printSettings.autoClose || autoClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  // Auto-print functionality
  useEffect(() => {
    if ((autoPrint || printSettings.autoPrint) && sale) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        handlePrint(printSettings.copies);
      }, 500);
    }
  }, [sale, autoPrint, printSettings.autoPrint, printSettings.copies]);

  const handleDownload = () => {
    // Create a simple text receipt for download
    const receiptText = generateReceiptText();
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.saleNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReceiptText = () => {
    let text = `
RECEIPT
===========================================
Sale Number: ${sale.saleNumber}
Date: ${formatDate(sale.saleDate)}
Staff: ${sale.createdBy?.fullName || 'Unknown'}

`;

    if (sale.customer?.name) {
      text += `CUSTOMER INFORMATION
-------------------------------------------
Name: ${sale.customer.name}
${sale.customer.email ? `Email: ${sale.customer.email}\n` : ''}${sale.customer.phone ? `Phone: ${sale.customer.phone}\n` : ''}${sale.customer.address ? `Address: ${sale.customer.address}\n` : ''}
`;
    }

    text += `ITEMS
-------------------------------------------
`;

    sale.items.forEach(item => {
      const productName = typeof item.product === 'object' ? item.product.name : 'Unknown Product';
      text += `${productName}
  Qty: ${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatPrice(item.totalPrice)}
`;
    });

    text += `
-------------------------------------------
Subtotal: ${formatPrice(sale.subtotal)}
${sale.tax > 0 ? `Tax: ${formatPrice(sale.tax)}\n` : ''}${sale.discount > 0 ? `Discount: -${formatPrice(sale.discount)}\n` : ''}TOTAL: ${formatPrice(sale.totalAmount)}

Payment Method: ${sale.paymentMethod.replace('_', ' ').toUpperCase()}
${sale.notes ? `\nNotes: ${sale.notes}` : ''}

Thank you for your business!
===========================================
`;

    return text;
  };

  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 no-print">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ReceiptIcon className="h-6 w-6 mr-2" />
            Sale Receipt
            {isPrinting && (
              <span className="ml-2 text-sm text-blue-600 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                Printing...
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Print Options Dropdown */}
            <div className="relative group">
              <button className="btn-secondary flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span>Options</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto Print</label>
                    <input
                      type="checkbox"
                      checked={printSettings.autoPrint}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, autoPrint: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto Close</label>
                    <input
                      type="checkbox"
                      checked={printSettings.autoClose}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, autoClose: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Copies</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={printSettings.copies}
                      onChange={(e) => setPrintSettings(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handlePrint(printSettings.copies)}
              disabled={isPrinting}
              className="btn-primary flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>{isPrinting ? 'Printing...' : `Print${printSettings.copies > 1 ? ` (${printSettings.copies})` : ''}`}</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="receipt-content bg-white p-8 border rounded-lg">
          {/* Business Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Car Parts Store</h1>
            <p className="text-gray-600">Barcode Scanner POS System</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>123 Main Street, City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
            </div>
          </div>

          {/* Sale Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <ReceiptIcon className="h-5 w-5 mr-2" />
                Sale Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Number:</span>
                  <span className="font-medium">{sale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(sale.saleDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Staff:</span>
                  <span className="font-medium">{sale.createdBy?.fullName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium capitalize">
                    {sale.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {(sale.customer?.name || sale.customer?.email || sale.customer?.phone) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  {sale.customer.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{sale.customer.name}</span>
                    </div>
                  )}
                  {sale.customer.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{sale.customer.email}</span>
                    </div>
                  )}
                  {sale.customer.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{sale.customer.phone}</span>
                    </div>
                  )}
                  {sale.customer.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{sale.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Items Purchased
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Item</th>
                    <th className="text-center py-2 font-medium text-gray-900">Qty</th>
                    <th className="text-right py-2 font-medium text-gray-900">Unit Price</th>
                    <th className="text-right py-2 font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, index) => {
                    const productName = typeof item.product === 'object' 
                      ? item.product.name 
                      : 'Unknown Product';
                    const barcode = typeof item.product === 'object' 
                      ? item.product.barcode 
                      : '';
                    
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-gray-900">{productName}</div>
                            {barcode && (
                              <div className="text-xs text-gray-500">Barcode: {barcode}</div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3">{formatPrice(item.unitPrice)}</td>
                        <td className="text-right py-3 font-medium">{formatPrice(item.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(sale.subtotal)}</span>
                  </div>
                  {sale.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatPrice(sale.tax)}</span>
                    </div>
                  )}
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">-{formatPrice(sale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(sale.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-700">{sale.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-2">
              This receipt was generated on {formatDate(new Date())}
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Car Parts Store - Barcode Scanner POS System</p>
              <p>For support, call (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .receipt-content {
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          
          .fixed {
            position: static !important;
          }
          
          .relative {
            position: static !important;
          }
          
          .mx-auto {
            margin: 0 !important;
          }
          
          .w-11/12 {
            width: 100% !important;
          }
          
          .max-w-4xl {
            max-width: none !important;
          }
          
          .p-5 {
            padding: 0 !important;
          }
          
          .mb-4 {
            margin-bottom: 0 !important;
          }
          
          /* Optimize for thermal receipt printers */
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          
          .receipt-content {
            width: 70mm;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            padding: 2px 0;
            text-align: left;
          }
          
          .text-center {
            text-align: center;
          }
          
          .text-right {
            text-align: right;
          }
        }
        
        /* Thermal printer specific styles */
        @media print and (max-width: 80mm) {
          .receipt-content {
            font-size: 10px;
          }
          
          .grid {
            display: block !important;
          }
          
          .grid > div {
            margin-bottom: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
