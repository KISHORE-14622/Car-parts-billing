import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import BarcodeScanner from '../components/BarcodeScanner';
import ShoppingCart from '../components/ShoppingCart';
import CheckoutForm from '../components/CheckoutForm';
import Receipt from '../components/Receipt';
import { 
  Scan, 
  Package, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  Eye,
  Clock,
  BarChart3,
  ShoppingCart as CartIcon,
  CreditCard,
  Plus
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, getAuthHeader } = useAuth();
  const { products, loading, error, fetchProducts } = useProducts();
  
  // Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Cart and checkout states
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Filter out any invalid scan history items
        const validHistory = parsedHistory.filter(scan => 
          scan && scan.product && scan.product.name && scan.product.barcode
        );
        setScanHistory(validHistory);
        // Update localStorage with cleaned data
        if (validHistory.length !== parsedHistory.length) {
          localStorage.setItem('scanHistory', JSON.stringify(validHistory));
        }
      } catch (error) {
        console.error('Error parsing scan history:', error);
        localStorage.removeItem('scanHistory');
      }
    }
  }, []);

  const handleBarcodeScanned = async (barcode) => {
    setShowScanner(false);
    setIsSearching(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`, {
        headers: getAuthHeader()
      });

      if (response.ok) {
        const product = await response.json();
        setScannedProduct(product);
        
        // Add to scan history
        const newScan = {
          id: Date.now(),
          product: product,
          timestamp: new Date().toISOString(),
          scannedBy: user.fullName
        };
        
        const updatedHistory = [newScan, ...scanHistory.slice(0, 9)]; // Keep last 10 scans
        setScanHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      } else {
        const data = await response.json();
        alert(data.message || 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error scanning barcode. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/products/barcode/${searchTerm.trim()}`, {
        headers: getAuthHeader()
      });

      if (response.ok) {
        const product = await response.json();
        setScannedProduct(product);
        
        // Add to scan history
        const newScan = {
          id: Date.now(),
          product: product,
          timestamp: new Date().toISOString(),
          scannedBy: user.fullName,
          method: 'manual'
        };
        
        const updatedHistory = [newScan, ...scanHistory.slice(0, 9)];
        setScanHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
        setSearchTerm('');
      } else {
        const data = await response.json();
        alert(data.message || 'Product not found');
      }
    } catch (error) {
      console.error('Error searching product:', error);
      alert('Error searching product. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('scanHistory');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock < 10) return { color: 'orange', text: 'Low Stock' };
    return { color: 'green', text: 'In Stock' };
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
    
    // Show success message
    alert(`${product.name} added to cart!`);
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
        setShowCheckout(false);
        clearCart();
        setScannedProduct(null);
        
        // Refresh products to update stock
        fetchProducts();
        
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullName}</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Scan className="h-5 w-5" />
          <span>Scan Barcode</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Barcode Scanner Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Scan className="h-5 w-5 mr-2" />
              Quick Scan
            </h2>
          </div>
          <div className="card-content">
            <p className="text-gray-600 mb-4">
              Scan a barcode to instantly view product details and check inventory.
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Scan className="h-5 w-5" />
              <span>Start Scanning</span>
            </button>
          </div>
        </div>

        {/* Manual Search Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Manual Search
            </h2>
          </div>
          <div className="card-content">
            <p className="text-gray-600 mb-4">
              Enter a barcode manually if scanning is not available.
            </p>
            <form onSubmit={handleManualSearch} className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter barcode..."
                className="input flex-1"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !searchTerm.trim()}
                className="btn-primary flex items-center space-x-1"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Scanned Product Details */}
      {scannedProduct && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Details
            </h2>
            <button
              onClick={() => setScannedProduct(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Image */}
              <div className="flex justify-center">
                {scannedProduct.image ? (
                  <img
                    src={scannedProduct.image}
                    alt={scannedProduct.name}
                    className="max-w-full h-64 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{scannedProduct.name}</h3>
                  <p className="text-gray-600">{scannedProduct.manufacturer}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Barcode</p>
                    <p className="font-mono text-lg">{scannedProduct.barcode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Part Number</p>
                    <p className="text-lg">{scannedProduct.partNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {typeof scannedProduct.category === 'object' ? scannedProduct.category.name : scannedProduct.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${scannedProduct.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Stock Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStockStatus(scannedProduct.stock).color === 'red' 
                        ? 'bg-red-100 text-red-800'
                        : getStockStatus(scannedProduct.stock).color === 'orange'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getStockStatus(scannedProduct.stock).text}
                    </span>
                    <span className="text-lg font-semibold">
                      {scannedProduct.stock} units
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-700">{scannedProduct.description}</p>
                </div>

                {/* Specifications */}
                {scannedProduct.specifications && Object.values(scannedProduct.specifications).some(val => val) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Specifications</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {scannedProduct.specifications.weight && (
                        <div>
                          <span className="font-medium">Weight:</span> {scannedProduct.specifications.weight}
                        </div>
                      )}
                      {scannedProduct.specifications.dimensions && (
                        <div>
                          <span className="font-medium">Dimensions:</span> {scannedProduct.specifications.dimensions}
                        </div>
                      )}
                      {scannedProduct.specifications.material && (
                        <div>
                          <span className="font-medium">Material:</span> {scannedProduct.specifications.material}
                        </div>
                      )}
                      {scannedProduct.specifications.warranty && (
                        <div>
                          <span className="font-medium">Warranty:</span> {scannedProduct.specifications.warranty}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => addToCart(scannedProduct)}
                    disabled={scannedProduct.stock === 0}
                    className={`w-full flex items-center justify-center space-x-2 ${
                      scannedProduct.stock === 0 
                        ? 'btn-secondary opacity-50 cursor-not-allowed' 
                        : 'btn-primary'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {scannedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Section - Cart and Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shopping Cart */}
        <ShoppingCart
          cartItems={cartItems}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          subtotal={cartTotals.subtotal}
          tax={cartTotals.tax}
          discount={cartTotals.discount}
          total={cartTotals.total}
        />

        {/* Checkout or Cart Actions */}
        {cartItems.length > 0 && !showCheckout && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Ready to Checkout
              </h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${cartTotals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Checkout</span>
                </button>
                
                <button
                  onClick={clearCart}
                  className="btn-secondary w-full"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        {showCheckout && (
          <CheckoutForm
            cartItems={cartItems}
            subtotal={cartTotals.subtotal}
            onCheckout={handleCheckout}
            isProcessing={isProcessingSale}
          />
        )}
      </div>

      {/* Quick Actions for Cart */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg border p-4 min-w-64">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Cart Summary</span>
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                {cartItems.length} items
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-semibold text-green-600">
                ${cartTotals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCheckout(!showCheckout)}
                className="btn-primary flex-1 text-sm py-2"
              >
                {showCheckout ? 'Hide Checkout' : 'Checkout'}
              </button>
              <button
                onClick={() => {
                  const element = document.querySelector('.shopping-cart');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary px-3 py-2"
              >
                <CartIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Scans
          </h2>
          {scanHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear History
            </button>
          )}
        </div>
        <div className="card-content">
          {scanHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No scans yet. Start scanning to see your history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scanHistory.map((scan) => {
                // Add null checks to prevent crashes
                if (!scan || !scan.product || !scan.product.name) {
                  return null;
                }
                
                return (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => setScannedProduct(scan.product)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{scan.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {scan.product.manufacturer || 'Unknown'} • {scan.product.barcode || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(scan.timestamp)}</p>
                      {scan.method === 'manual' && (
                        <p className="text-xs text-blue-600">Manual Search</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Scan Product Barcode</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Position the barcode within the camera view. The scanner will automatically detect and process the barcode.
              </p>
            </div>
            <BarcodeScanner 
              onScan={handleBarcodeScanned}
              onError={(error) => {
                console.error('Scanner error:', error);
                alert('Scanner error: ' + error);
              }}
            />
          </div>
        </div>
      )}

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

      {/* Loading Overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            <span>Searching for product...</span>
          </div>
        </div>
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

export default StaffDashboard;
