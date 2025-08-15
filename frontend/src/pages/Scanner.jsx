import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { Scan, AlertCircle, CheckCircle, Loader2, Package } from 'lucide-react';

const Scanner = () => {
  const navigate = useNavigate();
  const { fetchProductByBarcode, loading, error, clearError } = useProducts();
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleScan = async (barcode) => {
    try {
      clearError();
      const product = await fetchProductByBarcode(barcode);
      setScannedProduct(product);
      
      // Add to scan history
      setScanHistory(prev => {
        const newHistory = [{ barcode, product, timestamp: new Date() }, ...prev];
        return newHistory.slice(0, 10); // Keep only last 10 scans
      });
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Scan className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Barcode Scanner</h1>
        </div>
        <p className="text-lg text-gray-600">
          Scan or enter a barcode to get instant product information
        </p>
      </div>

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
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Product Found!</span>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductCard product={scannedProduct} />
            
            {/* Additional Actions */}
            <div className="space-y-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-content space-y-3">
                  <button
                    onClick={() => navigate(`/product/${scannedProduct._id}`)}
                    className="btn-primary w-full"
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

              {/* Product Summary */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">Quick Info</h3>
                </div>
                <div className="card-content space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barcode:</span>
                    <span className="font-mono">{scannedProduct.barcode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span>{scannedProduct.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturer:</span>
                    <span>{scannedProduct.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className={scannedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {scannedProduct.stock > 0 ? `${scannedProduct.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/product/${scan.product._id}`)}
                >
                  <div className="flex items-center space-x-3">
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
                    <div className="text-sm text-gray-600">
                      {scan.product.manufacturer}
                    </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
  );
};

export default Scanner;
