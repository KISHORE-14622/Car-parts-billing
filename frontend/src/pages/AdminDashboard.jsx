import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import BarcodeScanner from '../components/BarcodeScanner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Scan, 
  Package, 
  Users, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  Save,
  Tag,
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingCart as ShoppingCartIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, getAuthHeader } = useAuth();
  const { products, loading, error, fetchProducts, clearError } = useProducts();
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    categories: 0
  });

  const [revenueStats, setRevenueStats] = useState({
    today: { revenue: 0, sales: 0 },
    thisMonth: { revenue: 0, sales: 0 },
    thisYear: { revenue: 0, sales: 0 },
    topProducts: []
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState({
    year: new Date().getFullYear(),
    monthlyData: [],
    totalYearRevenue: 0,
    totalYearSales: 0
  });

  const [revenueLoading, setRevenueLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    manufacturer: '',
    partNumber: '',
    image: '',
    specifications: {
      weight: '',
      dimensions: '',
      material: '',
      warranty: ''
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRevenueStats();
    fetchMonthlyRevenue();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const totalProducts = products.length;
      const lowStock = products.filter(p => p.stock < 10).length;
      const uniqueCategories = new Set(products.map(p => p.category)).size;
      
      setStats({
        totalProducts,
        lowStock,
        categories: uniqueCategories
      });
    }
  }, [products]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setProductForm(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBarcodeScanned = (barcode) => {
    setProductForm(prev => ({
      ...prev,
      barcode: barcode
    }));
    setShowScanner(false);
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      barcode: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      manufacturer: '',
      partNumber: '',
      image: '',
      specifications: {
        weight: '',
        dimensions: '',
        material: '',
        warranty: ''
      }
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = editingProduct 
        ? `${API_BASE_URL}/products/${editingProduct._id}`
        : `${API_BASE_URL}/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });

      if (response.ok) {
        setShowProductForm(false);
        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      barcode: product.barcode,
      description: product.description,
      category: product.category?._id || product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      manufacturer: product.manufacturer,
      partNumber: product.partNumber,
      image: product.image || '',
      specifications: {
        weight: product.specifications?.weight || '',
        dimensions: product.specifications?.dimensions || '',
        material: product.specifications?.material || '',
        warranty: product.specifications?.warranty || ''
      }
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.message || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Revenue and sales functions
  const fetchRevenueStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/sales/stats`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setRevenueStats(data);
      } else {
        console.error('Error fetching revenue stats');
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  };

  const fetchMonthlyRevenue = async (year = new Date().getFullYear()) => {
    try {
      setRevenueLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/sales/revenue/monthly?year=${year}`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyRevenue(data);
      } else {
        console.error('Error fetching monthly revenue');
      }
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Category management functions
  const fetchCategories = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Error fetching categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setShowCategoryForm(false);
        setCategoryForm({ name: '', description: '' });
        fetchCategories();
        alert('Category added successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Error adding category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.fullName}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Tag className="h-5 w-5" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.today.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{revenueStats.today.sales} sales</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.thisMonth.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{revenueStats.thisMonth.sales} sales</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-gray-900">${revenueStats.thisYear.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{revenueStats.thisYear.sales} sales</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${revenueStats.thisMonth.sales > 0 ? (revenueStats.thisMonth.revenue / revenueStats.thisMonth.sales).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue ({monthlyRevenue.year})</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={monthlyRevenue.year}
                  onChange={(e) => fetchMonthlyRevenue(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-content">
              {revenueLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="ml-2">Loading revenue data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">${monthlyRevenue.totalYearRevenue.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total Sales</p>
                      <p className="text-2xl font-bold text-blue-900">{monthlyRevenue.totalYearSales}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {monthlyRevenue.monthlyData.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                          <span className="font-medium text-gray-900">{month.month}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{month.totalSales} sales</span>
                          <span className="font-bold text-gray-900">${month.totalRevenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products and Inventory Stats */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="card-content">
              {revenueStats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {revenueStats.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.productName}</p>
                        <p className="text-xs text-gray-500">{product.totalQuantity} sold</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">${product.totalRevenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No sales data available</p>
              )}
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Total Products</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.totalProducts}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Low Stock</span>
                  </div>
                  <span className="font-bold text-orange-600">{stats.lowStock}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Categories</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.categories}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found. Add your first product!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.manufacturer}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm">{product.barcode}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {typeof product.category === 'object' ? product.category?.name : product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock < 10 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleFormChange}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="barcode"
                        value={productForm.barcode}
                        onChange={handleFormChange}
                        className="input flex-1"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="btn-outline flex items-center space-x-1"
                      >
                        <Scan className="h-4 w-4" />
                        <span>Scan</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleFormChange}
                      className="input w-full"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Product Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={productForm.price}
                        onChange={handleFormChange}
                        step="0.01"
                        min="0"
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={productForm.stock}
                        onChange={handleFormChange}
                        min="0"
                        className="input w-full"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={productForm.manufacturer}
                      onChange={handleFormChange}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Part Number</label>
                    <input
                      type="text"
                      name="partNumber"
                      value={productForm.partNumber}
                      onChange={handleFormChange}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                    <input
                      type="url"
                      name="image"
                      value={productForm.image}
                      onChange={handleFormChange}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Specifications (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <input
                      type="text"
                      name="specifications.weight"
                      value={productForm.specifications.weight}
                      onChange={handleFormChange}
                      className="input w-full"
                      placeholder="e.g., 2.5 kg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                    <input
                      type="text"
                      name="specifications.dimensions"
                      value={productForm.specifications.dimensions}
                      onChange={handleFormChange}
                      className="input w-full"
                      placeholder="e.g., 10x5x3 cm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material</label>
                    <input
                      type="text"
                      name="specifications.material"
                      value={productForm.specifications.material}
                      onChange={handleFormChange}
                      className="input w-full"
                      placeholder="e.g., Steel, Aluminum"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warranty</label>
                    <input
                      type="text"
                      name="specifications.warranty"
                      value={productForm.specifications.warranty}
                      onChange={handleFormChange}
                      className="input w-full"
                      placeholder="e.g., 1 year"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    resetForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Category</h3>
              <button
                onClick={() => {
                  setShowCategoryForm(false);
                  setCategoryForm({ name: '', description: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  className="input w-full"
                  placeholder="e.g., Engine Parts"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  rows={3}
                  className="input w-full"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setCategoryForm({ name: '', description: '' });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Scan Barcode</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <BarcodeScanner 
              onScan={handleBarcodeScanned}
              onError={(error) => console.error('Scanner error:', error)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
