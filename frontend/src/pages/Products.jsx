import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { Loader2, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    pagination,
    searchTerm,
    selectedCategory,
    fetchProducts
  } = useProducts();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage, searchTerm, selectedCategory);
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = (term) => {
    setCurrentPage(1);
    fetchProducts(1, itemsPerPage, term, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setCurrentPage(1);
    fetchProducts(1, itemsPerPage, searchTerm, category);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="btn-outline w-10 h-10"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="flex items-center px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'btn-outline'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < pagination.totalPages && (
            <>
              {endPage < pagination.totalPages - 1 && (
                <span className="flex items-center px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className="btn-outline w-10 h-10"
              >
                {pagination.totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Package className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Car Parts Catalog</h1>
        </div>
        <p className="text-lg text-gray-600">
          Browse our extensive collection of automotive parts and accessories
        </p>
      </div>

      {/* Search and Filters */}
      <SearchBar onSearch={handleSearch} onCategoryChange={handleCategoryChange} />

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {products.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, pagination.totalProducts)} of{' '}
            {pagination.totalProducts} products
            {searchTerm && (
              <span className="ml-2">
                for "<span className="font-medium text-gray-900">{searchTerm}</span>"
              </span>
            )}
            {selectedCategory && (
              <span className="ml-2">
                in <span className="font-medium text-gray-900">{selectedCategory}</span>
              </span>
            )}
          </div>
          <div>
            Page {currentPage} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-16">
          <div className="space-y-4">
            <div className="text-red-600 text-lg font-medium">
              Error loading products
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchProducts(currentPage, itemsPerPage, searchTerm, selectedCategory)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {!loading && !error && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="badge-primary text-xs">
                            {typeof product.category === 'object' ? product.category?.name : product.category}
                          </span>
                          <span className="text-sm text-gray-500">#{product.partNumber}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Manufacturer: {product.manufacturer}</span>
                          <span>Stock: {product.stock}</span>
                          <span>Barcode: {product.barcode}</span>
                        </div>
                      </div>
                      
                      {/* Price and Actions */}
                      <div className="flex-shrink-0 text-right ml-4">
                        <div className="text-2xl font-bold text-primary-600 mb-2">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="space-y-2">
                          <button 
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="btn-primary text-sm px-4 py-2 w-full"
                          >
                            View Details
                          </button>
                          <div className={`text-xs px-2 py-1 rounded-full text-center ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Products Found */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search criteria or filters.'
              : 'No products are currently available.'}
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                handleSearch('');
                handleCategoryChange('');
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && products.length > 0 && (
        <div className="space-y-4">
          {renderPagination()}
          
          {/* Results Info */}
          <div className="text-center text-sm text-gray-600">
            Showing {products.length} of {pagination.totalProducts} products
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
