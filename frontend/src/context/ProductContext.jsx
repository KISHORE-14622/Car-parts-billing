import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  categories: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  }
};

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCTS':
      return { 
        ...state, 
        products: action.payload.products,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    case 'SET_CURRENT_PRODUCT':
      return { ...state, currentProduct: action.payload, loading: false, error: null };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'CLEAR_CURRENT_PRODUCT':
      return { ...state, currentProduct: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  const { getAuthHeader } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch all products with pagination and filters
  const fetchProducts = async (page = 1, limit = 12, search = '', category = '') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await axios.get(`${API_BASE_URL}/products?${params}`, {
        headers: getAuthHeader()
      });
      dispatch({ type: 'SET_PRODUCTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch products' });
    }
  };

  // Fetch product by barcode
  const fetchProductByBarcode = async (barcode) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_BASE_URL}/products/barcode/${barcode}`, {
        headers: getAuthHeader()
      });
      dispatch({ type: 'SET_CURRENT_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Product not found';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Fetch product by ID
  const fetchProductById = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeader()
      });
      dispatch({ type: 'SET_CURRENT_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Product not found' });
      throw error;
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories/list`, {
        headers: getAuthHeader()
      });
      dispatch({ type: 'SET_CATEGORIES', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Add new product
  const addProduct = async (productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post(`${API_BASE_URL}/products`, productData, {
        headers: getAuthHeader()
      });
      // Refresh products list
      await fetchProducts();
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to add product' });
      throw error;
    }
  };

  // Update product
  const updateProduct = async (id, productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData, {
        headers: getAuthHeader()
      });
      dispatch({ type: 'SET_CURRENT_PRODUCT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update product' });
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeader()
      });
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete product' });
      throw error;
    }
  };

  // Set search term
  const setSearchTerm = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  // Set selected category
  const setSelectedCategory = (category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  // Clear current product
  const clearCurrentProduct = () => {
    dispatch({ type: 'CLEAR_CURRENT_PRODUCT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const value = {
    ...state,
    fetchProducts,
    fetchProductByBarcode,
    fetchProductById,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    setSearchTerm,
    setSelectedCategory,
    clearCurrentProduct,
    clearError
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
