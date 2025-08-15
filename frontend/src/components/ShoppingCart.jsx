import React from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package 
} from 'lucide-react';

const ShoppingCartComponent = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  subtotal,
  tax,
  discount,
  total
}) => {
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="card shopping-cart">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Shopping Cart
          </h2>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-2">Scan products to add them to your cart</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shopping-cart">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Shopping Cart ({cartItems.length} items)
        </h2>
        <button
          onClick={onClearCart}
          className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear Cart</span>
        </button>
      </div>
      <div className="card-content">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
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
                  <p className="text-sm font-medium text-green-600">{formatPrice(item.product.price)} each</p>
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
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
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

        {/* Cart Summary */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Stock Warnings */}
        {cartItems.some(item => item.quantity >= item.product.stock) && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
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
