import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  CreditCard, 
  DollarSign, 
  Building, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Percent,
  Tag,
  X,
  Minimize2
} from 'lucide-react';

const ShoppingCartComponent = ({ 
  cartItems, 
  onUpdateQuantity, 
  onUpdatePrice,
  onRemoveItem, 
  onClearCart,
  subtotal,
  tax,
  discount,
  total,
  horizontal = false,
  fullHeight = false,
  onCheckout,
  isProcessing = false,
  onClose = null,
  showCloseButton = false
}) => {
  // Checkout form state
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
  const [showCheckoutForm, setShowCheckoutForm] = useState(true); // Always show checkout form when cart has items
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Quantity editing state
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');
  
  // Price editing state
  const [editingPrice, setEditingPrice] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

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
    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (currentSubtotal * (parseFloat(formData.taxRate) || 0)) / 100;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const finalTotal = currentSubtotal + taxAmount - discountAmount;
    
    return {
      subtotal: currentSubtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: Math.max(0, finalTotal)
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
    const currentSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (discountAmount < 0 || discountAmount > currentSubtotal) {
      newErrors.discountAmount = `Discount cannot exceed subtotal ($${currentSubtotal.toFixed(2)})`;
    }
    
    // Validate email format if provided
    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = (e) => {
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

  // Quantity editing functions
  const handleQuantityClick = (itemId, currentQuantity) => {
    setEditingQuantity(itemId);
    setTempQuantity(currentQuantity.toString());
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string for editing, or valid numbers
    if (value === '' || /^\d+$/.test(value)) {
      setTempQuantity(value);
    }
  };

  const handleQuantitySubmit = (itemId, maxStock) => {
    const newQuantity = parseInt(tempQuantity) || 1;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    
    onUpdateQuantity(itemId, validQuantity);
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleQuantityKeyDown = (e, itemId, maxStock) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuantitySubmit(itemId, maxStock);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleQuantityCancel();
    }
  };

  // Price editing functions
  const handlePriceClick = (itemId, currentPrice) => {
    setEditingPrice(itemId);
    setTempPrice(currentPrice.toString());
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string for editing, or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTempPrice(value);
    }
  };

  const handlePriceSubmit = (itemId) => {
    const newPrice = parseFloat(tempPrice) || 0.01;
    const validPrice = Math.max(0.01, newPrice); // Minimum price of $0.01
    
    if (onUpdatePrice) {
      onUpdatePrice(itemId, validPrice);
    }
    setEditingPrice(null);
    setTempPrice('');
  };

  const handlePriceCancel = () => {
    setEditingPrice(null);
    setTempPrice('');
  };

  const handlePriceKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePriceSubmit(itemId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handlePriceCancel();
    }
  };
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const totals = calculateTotals();

  if (cartItems.length === 0) {
    return (
      <div className={`card shopping-cart ${horizontal ? 'w-full' : ''} ${fullHeight ? 'h-screen flex flex-col' : ''}`}>
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart
            </h2>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Minimize Cart"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className={`card-content ${fullHeight ? 'flex-1 flex items-center justify-center' : ''}`}>
          <div className="text-center py-4">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-2">Scan products to add them to your cart</p>
          </div>
        </div>
      </div>
    );
  }

  if (horizontal && !fullHeight) {
    return (
      <div className="card shopping-cart w-full">
        <div className="card-header">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart ({cartItems.length} items)
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">{formatPrice(total)}</span>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <button
                onClick={onClearCart}
                className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </button>
              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title="Minimize Cart"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card-content">
          {/* Horizontal Cart Items */}
          <div className="flex space-x-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {cartItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 min-w-64 max-w-64">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{item.product.manufacturer}</p>
                    {editingPrice === item.id ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">$</span>
                        <input
                          type="text"
                          value={tempPrice}
                          onChange={handlePriceChange}
                          onKeyDown={(e) => handlePriceKeyDown(e, item.id)}
                          onBlur={() => handlePriceSubmit(item.id)}
                          className="w-12 text-xs font-medium text-green-600 border border-blue-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <span className="text-xs text-gray-500">each</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onUpdatePrice && handlePriceClick(item.id, item.product.price)}
                        className={`text-xs font-medium text-green-600 ${onUpdatePrice ? 'hover:bg-blue-50 hover:text-blue-600 rounded px-1 cursor-pointer transition-colors' : ''}`}
                        title={onUpdatePrice ? "Click to edit price" : ""}
                        disabled={!onUpdatePrice}
                      >
                        {formatPrice(item.product.price)} each
                      </button>
                    )}
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        {editingQuantity === item.id ? (
                          <input
                            type="text"
                            value={tempQuantity}
                            onChange={handleQuantityChange}
                            onKeyDown={(e) => handleQuantityKeyDown(e, item.id, item.product.stock)}
                            onBlur={() => handleQuantitySubmit(item.id, item.product.stock)}
                            className="w-8 text-center text-sm font-medium border border-blue-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => handleQuantityClick(item.id, item.quantity)}
                            className="w-8 text-center text-sm font-medium hover:bg-blue-50 hover:text-blue-600 rounded px-1 cursor-pointer transition-colors"
                            title="Click to edit quantity"
                          >
                            {item.quantity}
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right mt-1">
                      <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Summary */}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 text-sm">
                <span className="text-gray-600">Subtotal: {formatPrice(subtotal)}</span>
                {tax > 0 && <span className="text-gray-600">Tax: {formatPrice(tax)}</span>}
                {discount > 0 && <span className="text-green-600">Discount: -{formatPrice(discount)}</span>}
              </div>
              <div className="text-lg font-semibold text-green-600">
                Total: {formatPrice(total)}
              </div>
            </div>
          </div>

          {/* Stock Warnings */}
          {cartItems.some(item => item.quantity >= item.product.stock) && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
              <strong>Stock Warning:</strong> Some items have reached maximum available quantity.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical layout (original) or Full Height layout
  return (
    <div className={`card shopping-cart ${fullHeight ? 'h-screen flex flex-col' : ''}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Shopping Cart ({cartItems.length} items)
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearCart}
              className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Cart</span>
            </button>
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                title="Minimize Cart"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`card-content ${fullHeight ? 'flex-1 flex flex-col' : ''}`}>
        {/* Cart Items */}
        <div className={`space-y-4 mb-6 ${fullHeight ? 'flex-1 overflow-y-auto' : 'max-h-[400px] overflow-y-auto'}`}>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.manufacturer}</p>
                  <p className="text-sm text-gray-500">Barcode: {item.product.barcode}</p>
                  {editingPrice === item.id ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">$</span>
                      <input
                        type="text"
                        value={tempPrice}
                        onChange={handlePriceChange}
                        onKeyDown={(e) => handlePriceKeyDown(e, item.id)}
                        onBlur={() => handlePriceSubmit(item.id)}
                        className="w-16 text-sm font-medium text-green-600 border border-blue-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <span className="text-sm text-gray-500">each</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpdatePrice && handlePriceClick(item.id, item.product.price)}
                      className={`text-sm font-medium text-green-600 ${onUpdatePrice ? 'hover:bg-blue-50 hover:text-blue-600 rounded px-1 cursor-pointer transition-colors' : ''}`}
                      title={onUpdatePrice ? "Click to edit price" : ""}
                      disabled={!onUpdatePrice}
                    >
                      {formatPrice(item.product.price)} each
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  {editingQuantity === item.id ? (
                    <input
                      type="text"
                      value={tempQuantity}
                      onChange={handleQuantityChange}
                      onKeyDown={(e) => handleQuantityKeyDown(e, item.id, item.product.stock)}
                      onBlur={() => handleQuantitySubmit(item.id, item.product.stock)}
                      className="w-12 text-center font-medium border border-blue-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleQuantityClick(item.id, item.quantity)}
                      className="w-12 text-center font-medium hover:bg-blue-50 hover:text-blue-600 rounded px-1 cursor-pointer transition-colors"
                      title="Click to edit quantity"
                    >
                      {item.quantity}
                    </button>
                  )}
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-0">
                  <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.product.price)}</p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary and Checkout - Fixed at bottom when fullHeight */}
        <div className={`border-t pt-4 ${fullHeight ? 'flex-shrink-0' : ''}`}>
          {/* Quick Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(totals.subtotal)}</span>
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

          {/* Quick Payment Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, paymentMethod: 'cash', taxRate: 0, discountAmount: 0 }));
                const event = { preventDefault: () => {} };
                handleCheckout(event);
              }}
              disabled={isProcessing || cartItems.length === 0}
              className="btn-primary flex items-center justify-center space-x-1 text-xs py-2"
            >
              <DollarSign className="h-3 w-3" />
              <span>Quick Cash</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, paymentMethod: 'card', taxRate: 0, discountAmount: 0 }));
                const event = { preventDefault: () => {} };
                handleCheckout(event);
              }}
              disabled={isProcessing || cartItems.length === 0}
              className="btn-secondary flex items-center justify-center space-x-1 text-xs py-2"
            >
              <CreditCard className="h-3 w-3" />
              <span>Quick Card</span>
            </button>
          </div>

          {/* Billing Section Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing & Payment
            </h3>
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-xs text-primary-600 hover:text-primary-800"
            >
              {showAdvancedOptions ? 'Hide Options' : 'More Options'}
            </button>
          </div>

          {/* Checkout Form - Always Visible */}
          <form onSubmit={handleCheckout} className="space-y-3">
            {/* Payment Method - Always Visible */}
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
                <CreditCard className="h-3 w-3 mr-1" />
                Payment Method
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash', label: 'Cash', icon: DollarSign },
                  { value: 'card', label: 'Card', icon: CreditCard },
                  { value: 'bank_transfer', label: 'Transfer', icon: Building },
                  { value: 'check', label: 'Check', icon: FileText }
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors text-xs ${
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
                    <Icon className="h-3 w-3 mr-1" />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>
              )}
            </div>

            {/* Advanced Options - Collapsible */}
            {showAdvancedOptions && (
              <div className="space-y-3 border-t pt-3">
                {/* Tax and Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="number"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        className={`input text-xs pl-7 ${errors.taxRate ? 'border-red-500' : ''}`}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    {errors.taxRate && (
                      <p className="text-xs text-red-600 mt-1">{errors.taxRate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Discount ($)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="number"
                        name="discountAmount"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        className={`input text-xs pl-7 ${errors.discountAmount ? 'border-red-500' : ''}`}
                        placeholder="0.00"
                        min="0"
                        max={totals.subtotal}
                        step="0.01"
                      />
                    </div>
                    {errors.discountAmount && (
                      <p className="text-xs text-red-600 mt-1">{errors.discountAmount}</p>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Customer Information (Optional)
                  </h5>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="input text-xs"
                        placeholder="Customer name"
                      />
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`input text-xs ${errors.customerEmail ? 'border-red-500' : ''}`}
                        placeholder="Email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="input text-xs"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        name="customerAddress"
                        value={formData.customerAddress}
                        onChange={handleInputChange}
                        className="input text-xs"
                        placeholder="Address"
                      />
                    </div>
                    {errors.customerEmail && (
                      <p className="text-xs text-red-600">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="input text-xs"
                    placeholder="Add notes for this sale..."
                  />
                </div>
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="btn-primary w-full flex items-center justify-center space-x-2 text-sm py-3"
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

        {/* Stock Warnings */}
        {cartItems.some(item => item.quantity >= item.product.stock) && (
          <div className={`mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg ${fullHeight ? 'flex-shrink-0' : ''}`}>
            <p className="text-sm text-orange-800">
              <strong>Stock Warning:</strong> Some items have reached maximum available quantity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
