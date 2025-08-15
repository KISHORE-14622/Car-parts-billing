import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SearchBar = ({ onSearch, onCategoryChange }) => {
  const { categories, searchTerm, selectedCategory, setSearchTerm, setSelectedCategory } = useProducts();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(localSearchTerm);
    onSearch?.(localSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    onSearch?.('');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory('');
    onCategoryChange?.('');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, manufacturers, part numbers..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="input pl-10 pr-20 w-full"
          />
          {localSearchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary h-8 px-3 text-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {selectedCategory && (
            <span className="badge-primary ml-2">1</span>
          )}
        </button>

        {/* Active Filters */}
        {selectedCategory && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            <div className="flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm">
              <span>{selectedCategory}</span>
              <button
                onClick={handleClearCategory}
                className="ml-1 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card animate-fade-in">
          <div className="card-content">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Filter by Category</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === ''
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Clear All Filters */}
              {selectedCategory && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClearCategory}
                    className="btn-secondary text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
