import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductCard from '../components/ProductCard';
import ShoppingCart from '../components/ShoppingCart';
import Receipt from '../components/Receipt';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Scan, AlertCircle, CheckCircle, Loader2, Package, Plus, ShoppingCart as CartIcon } from 'lucide-react';

const Scanner = () => {
  const navigate = useNavigate();
  const { fetchProductByBarcode, loading, error, clearError } = useProducts();
  const { getAuthHeader } = useAuth();
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualBarcode, setManualBarcode] = useState('');

  // Cart and checkout states
  const [cartItems, setCartItems] = useState([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleScan = async (barcode) => {
    try {
      clearError();
      const product = await fetchProductByBarcode(barcode);
      
      // Automatically add to cart if product is in stock
      if (product.stock > 0) {
        addToCart(product);
        // Product added silently to cart
      } else {
        // Show out of stock message
        alert(`❌ ${product.name} is out of stock and cannot be added to cart.`);
      }
      
      // Add to scan history
      setScanHistory(prev => {
        const newHistory = [{ barcode, product, timestamp: new Date() }, ...prev];
        return newHistory.slice(0, 10); // Keep only last 10 scans
      });
      
      // Optional: Still set scannedProduct for display but don't show modal by default
      // setScannedProduct(product);
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setScannedProduct(null);
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      await handleScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleScanError = (errorMessage) => {
    console.error('Scanner error:', errorMessage);
  };

  const clearResults = () => {
    setScannedProduct(null);
    clearError();
  };

  // Cart functionality
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
      updateCartItemQuantity(existingItem.id, newQuantity);
    } else {
      // Add new item to cart
      const cartItem = {
        id: Date.now(),
        product: product,
        quantity: Math.min(quantity, product.stock),
        totalPrice: product.price * Math.min(quantity, product.stock)
      };
      setCartItems(prev => [...prev, cartItem]);
    }
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, totalPrice: item.product.price * newQuantity }
          : item
      )
    );
  };

  const updateCartItemPrice = (itemId, newPrice) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              product: { ...item.product, price: newPrice },
              totalPrice: newPrice * item.quantity 
            }
          : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart totals
  const calculateCartTotals = (tax = 0, discount = 0) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = discount;
    const total = subtotal + taxAmount - discountAmount;
    
    return {
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: Math.max(0, total)
    };
  };

  // Checkout functionality
  const handleCheckout = async (checkoutData) => {
    setIsProcessingSale(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const sale = await response.json();
        setCompletedSale(sale);
        setShowReceipt(true);
        clearCart();
        setScannedProduct(null);
        
        alert('Sale completed successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Error processing sale');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const cartTotals = calculateCartTotals();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <CartIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Barcode Scanner & Billing</h1>
        </div>
        <p className="text-lg text-gray-600">
          Scan products and manage your cart for quick checkout
        </p>
      </div>

      {/* Main Layout - Cart and Scanner Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Shopping Cart (Billing Section) */}
        <div className="order-2 lg:order-1">
          <ShoppingCart
            cartItems={cartItems}
            onUpdateQuantity={updateCartItemQuantity}
            onUpdatePrice={updateCartItemPrice}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            subtotal={cartTotals.subtotal}
            tax={cartTotals.tax}
            discount={cartTotals.discount}
            total={cartTotals.total}
            onCheckout={handleCheckout}
            isProcessing={isProcessingSale}
          />
        </div>

        {/* Right Column - Scanner Section */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Manual Barcode Input */}
          <div className="card">
            <div className="card-content">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Manual Barcode Entry
              </h2>
              <form onSubmit={handleManualScan} className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter barcode manually (e.g., 1234567890123)"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !manualBarcode.trim()}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Scan className="h-4 w-4" />
                  )}
                  <span>Scan</span>
                </button>
              </form>
            </div>
          </div>

          {/* Camera Scanner */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Camera Scanner
              </h2>
              <p className="text-sm text-gray-600">
                Use your device's camera to scan barcodes
              </p>
            </div>
            <div className="card-content">
              <BarcodeScanner onScan={handleScan} onError={handleScanError} />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-center space-x-3 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="text-lg text-gray-600">Searching for product...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="card border-red-200 bg-red-50">
              <div className="card-content">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">Product Not Found</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={clearResults}
                    className="btn-secondary text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Product Result */}
          {scannedProduct && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Product Found!</span>
                </div>
                <button
                  onClick={() => addToCart(scannedProduct)}
                  disabled={scannedProduct.stock === 0}
                  className={`flex items-center space-x-2 ${
                    scannedProduct.stock === 0 
                      ? 'btn-secondary opacity-50 cursor-not-allowed' 
                      : 'btn-primary'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
              
              <ProductCard product={scannedProduct} />
              
              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-content space-y-3">
                  <button
                    onClick={() => navigate(`/product/${scannedProduct._id}`)}
                    className="btn-outline w-full"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={clearResults}
                    className="btn-outline w-full"
                  >
                    Scan Another Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Recent Scans</h2>
                <p className="text-sm text-gray-600">Your last {scanHistory.length} scanned products</p>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 cursor-pointer"
                           onClick={() => navigate(`/product/${scan.product._id}`)}>
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{scan.product.name}</div>
                          <div className="text-sm text-gray-600">
                            Barcode: {scan.barcode} • {scan.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          ${scan.product.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => addToCart(scan.product)}
                          disabled={scan.product.stock === 0}
                          className={`text-xs px-2 py-1 rounded mt-1 ${
                            scan.product.stock === 0 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sample Barcodes for Testing */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-blue-900">Sample Barcodes for Testing</h2>
              <p className="text-sm text-blue-700">Try scanning these sample barcodes:</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-mono font-medium">1234567890123</div>
                  <div className="text-gray-600">Brake Pads</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-mono font-medium">2345678901234</div>
                  <div className="text-gray-600">Oil Filter</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-mono font-medium">3456789012345</div>
                  <div className="text-gray-600">Spark Plugs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedSale && (
        <Receipt
          sale={completedSale}
          onClose={() => {
            setShowReceipt(false);
            setCompletedSale(null);
          }}
          onPrint={() => {
            console.log('Receipt printed');
          }}
        />
      )}

      {/* Processing Sale Overlay */}
      {isProcessingSale && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            <span>Processing sale...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
