import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Building, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Percent,
  Tag
} from 'lucide-react';

const CheckoutForm = ({ 
  cartItems, 
  subtotal, 
  onCheckout, 
  isProcessing 
}) => {
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    
    // Payment Information
    paymentMethod: 'cash',
    
    // Additional Charges
    taxRate: 0,
    discountAmount: 0,
    
    // Notes
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculateTotals = () => {
    const taxAmount = (subtotal * (parseFloat(formData.taxRate) || 0)) / 100;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const total = subtotal + taxAmount - discountAmount;
    
    return {
      tax: taxAmount,
      discount: discountAmount,
      total: Math.max(0, total)
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Payment method is required
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    
    // Validate tax rate
    const taxRate = parseFloat(formData.taxRate);
    if (taxRate < 0 || taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }
    
    // Validate discount
    const discountAmount = parseFloat(formData.discountAmount);
    if (discountAmount < 0 || discountAmount > subtotal) {
      newErrors.discountAmount = `Discount cannot exceed subtotal ($${subtotal.toFixed(2)})`;
    }
    
    // Validate email format if provided
    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const totals = calculateTotals();
    
    const checkoutData = {
      items: cartItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      })),
      customer: {
        name: formData.customerName || '',
        email: formData.customerEmail || '',
        phone: formData.customerPhone || '',
        address: formData.customerAddress || ''
      },
      paymentMethod: formData.paymentMethod,
      tax: totals.tax,
      discount: totals.discount,
      notes: formData.notes || ''
    };
    
    onCheckout(checkoutData);
  };

  const totals = calculateTotals();
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Checkout
        </h2>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customer Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className={`input pl-10 ${errors.customerEmail ? 'border-red-500' : ''}`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.customerEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Customer address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Method
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: DollarSign },
                { value: 'card', label: 'Card', icon: CreditCard },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
                { value: 'check', label: 'Check', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.paymentMethod === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={formData.paymentMethod === value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="text-sm text-red-600 mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Tax and Discount */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Additional Charges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className={`input pl-10 ${errors.taxRate ? 'border-red-500' : ''}`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                {errors.taxRate && (
                  <p className="text-sm text-red-600 mt-1">{errors.taxRate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount ($)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    className={`input pl-10 ${errors.discountAmount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                    min="0"
                    max={subtotal}
                    step="0.01"
                  />
                </div>
                {errors.discountAmount && (
                  <p className="text-sm text-red-600 mt-1">{errors.discountAmount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="input"
              placeholder="Add any additional notes for this sale..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cartItems.length} items):</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {totals.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">{formatPrice(totals.tax)}</span>
                </div>
              )}
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-{formatPrice(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">{formatPrice(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || cartItems.length === 0}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Sale...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Complete Sale - {formatPrice(totals.total)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
