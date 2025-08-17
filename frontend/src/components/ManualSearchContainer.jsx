import React from 'react';
import { Package, X, Plus, Eye } from 'lucide-react';

const ManualSearchContainer = ({ searchResults, onClearResults, onAddToCart, onViewProduct }) => {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock < 10) return { color: 'orange', text: 'Low Stock' };
    return { color: 'green', text: 'In Stock' };
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Manual Search Results
        </h2>
        <button
          onClick={onClearResults}
          className="text-gray-400 hover:text-gray-600"
          title="Clear search results"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          {searchResults.map((product, index) => (
            <div key={`${product._id}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="flex justify-center lg:justify-start">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-48 h-48 object-contain rounded-lg border bg-white"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <p className="text-gray-600">{product.manufacturer}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Barcode</p>
                      <p className="font-mono text-base">{product.barcode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Part Number</p>
                      <p className="text-base">{product.partNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-base font-semibold text-green-600">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Stock Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStockStatus(product.stock).color === 'red' 
                          ? 'bg-red-100 text-red-800'
                          : getStockStatus(product.stock).color === 'orange'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getStockStatus(product.stock).text}
                      </span>
                      <span className="text-base font-semibold">
                        {product.stock} units
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-gray-700 text-sm">{product.description}</p>
                  </div>

                  {/* Specifications */}
                  {product.specifications && Object.values(product.specifications).some(val => val) && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Specifications</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {product.specifications.weight && (
                          <div>
                            <span className="font-medium">Weight:</span> {product.specifications.weight}
                          </div>
                        )}
                        {product.specifications.dimensions && (
                          <div>
                            <span className="font-medium">Dimensions:</span> {product.specifications.dimensions}
                          </div>
                        )}
                        {product.specifications.material && (
                          <div>
                            <span className="font-medium">Material:</span> {product.specifications.material}
                          </div>
                        )}
                        {product.specifications.warranty && (
                          <div>
                            <span className="font-medium">Warranty:</span> {product.specifications.warranty}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => onViewProduct(product)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex items-center space-x-2 ${
                        product.stock === 0 
                          ? 'btn-secondary opacity-50 cursor-not-allowed' 
                          : 'btn-primary'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {searchResults.length > 1 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Showing {searchResults.length} manually searched product{searchResults.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualSearchContainer;
