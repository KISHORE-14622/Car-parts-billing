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
  total,
  horizontal = false
}) => {
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className={`card shopping-cart ${horizontal ? 'w-full' : ''}`}>
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Shopping Cart
          </h2>
        </div>
        <div className="card-content">
          <div className="text-center py-4">
            <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Your cart is empty</p>
            <p className="text-xs text-gray-500 mt-1">Scan products to add them to your cart</p>
          </div>
        </div>
      </div>
    );
  }

  if (horizontal) {
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
                    <p className="text-xs font-medium text-green-600">{formatPrice(item.product.price)} each</p>
                    
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
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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

  // Vertical layout (original)
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
