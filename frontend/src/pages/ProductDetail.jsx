import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Wrench, 
  Calendar,
  Barcode,
  Truck,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, error, fetchProductById, clearCurrentProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
    
    return () => {
      clearCurrentProduct();
    };
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', icon: XCircle };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', icon: Info };
    return { text: 'In Stock', color: 'text-green-600', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="text-center py-16">
        <div className="space-y-4">
          <Package className="h-16 w-16 text-gray-300 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-gray-600">{error || 'The requested product could not be found.'}</p>
          <div className="space-x-4">
            <button onClick={() => navigate(-1)} className="btn-outline">
              Go Back
            </button>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = currentProduct;
  const stockStatus = getStockStatus(product.stock);
  const StockIcon = stockStatus.icon;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'compatibility', label: 'Compatibility' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-outline flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Product Header */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="h-24 w-24" />
            </div>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="card-content text-center">
                <Barcode className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Barcode</div>
                <div className="font-mono text-sm font-medium">{product.barcode}</div>
              </div>
            </div>
            <div className="card">
              <div className="card-content text-center">
                <Wrench className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Part Number</div>
                <div className="font-mono text-sm font-medium">{product.partNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div className="space-y-2">
            <div className="badge-primary inline-block">{product.category}</div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {/* Price and Stock */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-3xl font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
              <span className={`font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
              <span className="text-gray-600">
                ({product.stock} units available)
              </span>
            </div>
          </div>

          {/* Manufacturer Info */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Manufacturer</div>
                  <div className="font-semibold text-gray-900">{product.manufacturer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Added</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(product.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              disabled={product.stock === 0}
              className={`w-full ${
                product.stock === 0 
                  ? 'btn-secondary cursor-not-allowed opacity-50' 
                  : 'btn-primary'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-outline">
                <Shield className="h-4 w-4 mr-2" />
                Warranty Info
              </button>
              <button className="btn-outline">
                <Truck className="h-4 w-4 mr-2" />
                Shipping Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Product Overview</h2>
              </div>
              <div className="card-content">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• High-quality construction</li>
                        <li>• Direct fit replacement</li>
                        <li>• Manufacturer warranty included</li>
                        <li>• Professional installation recommended</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">What's Included</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• {product.name}</li>
                        <li>• Installation hardware (if applicable)</li>
                        <li>• Manufacturer documentation</li>
                        <li>• Warranty certificate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Technical Specifications</h2>
            </div>
            <div className="card-content">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <dt className="font-medium text-gray-900">Weight</dt>
                    <dd className="text-gray-700">{product.specifications?.weight || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Dimensions</dt>
                    <dd className="text-gray-700">{product.specifications?.dimensions || 'Not specified'}</dd>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <dt className="font-medium text-gray-900">Material</dt>
                    <dd className="text-gray-700">{product.specifications?.material || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-900">Warranty</dt>
                    <dd className="text-gray-700">{product.specifications?.warranty || 'Not specified'}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compatibility' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Vehicle Compatibility</h2>
            </div>
            <div className="card-content">
              {product.compatibility && product.compatibility.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This part is compatible with the following vehicles:
                  </p>
                  <div className="grid gap-3">
                    {product.compatibility.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900">
                            {comp.make} {comp.model}
                          </div>
                          <div className="text-gray-600">
                            {comp.year}
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  No specific compatibility information available. Please consult with a professional 
                  or contact our support team for vehicle-specific fitment details.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
