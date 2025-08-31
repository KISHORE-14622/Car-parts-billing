import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Receipt, 
  Calendar, 
  Filter, 
  Download, 
  Loader2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  User,
  Package
} from 'lucide-react';

const SaleDetails = () => {
  const { getAuthHeader } = useAuth();
  
  // State management
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSales: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: '',
    day: ''
  });

  // Summary stats
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0
  });

  // Fetch sales data
  const fetchSales = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      // Add date filters
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`${API_BASE_URL}/sales?${params}`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales);
        setPagination(data.pagination);
        
        // Calculate summary stats
        const totalRevenue = data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalSales = data.sales.length;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        setSummary({
          totalRevenue,
          totalSales,
          averageOrderValue
        });
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchSales(1); // Reset to first page when applying filters
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      month: '',
      day: ''
    });
    // Fetch all sales without filters
    setTimeout(() => fetchSales(1), 100);
  };

  // Handle month filter
  const handleMonthFilter = (monthValue) => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, monthValue - 1, 1);
    const endDate = new Date(currentYear, monthValue, 0);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      month: monthValue.toString()
    }));
  };

  // Handle day filter (last N days)
  const handleDayFilter = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      day: days.toString()
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Build query parameters with current filters
      const params = new URLSearchParams();
      
      // Add date filters if they exist
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`${API_BASE_URL}/sales/export/csv?${params}`, {
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        // Get the CSV content
        const csvContent = await response.text();
        
        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Set filename with current date
        const filename = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', filename);
        
        // Trigger download
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        console.log('CSV export completed successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError(`Export failed: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSales();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    if (filters.startDate || filters.endDate) {
      applyFilters();
    }
  }, [filters.startDate, filters.endDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-primary-600" />
            <span>Sale Details</span>
          </h1>
          <p className="text-gray-600">View and analyze all sales transactions</p>
        </div>
        <div>
          <button
            onClick={exportToCSV}
            disabled={exportLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalSales}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input w-full"
              />
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Month Filter</label>
              <select
                value={filters.month}
                onChange={(e) => e.target.value ? handleMonthFilter(parseInt(e.target.value)) : clearFilters()}
                className="input w-full"
              >
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Day Filter</label>
              <select
                value={filters.day}
                onChange={(e) => e.target.value ? handleDayFilter(parseInt(e.target.value)) : clearFilters()}
                className="input w-full"
              >
                <option value="">All Days</option>
                <option value="1">Last 1 Day</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={applyFilters}
              className="btn-primary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
            <button
              onClick={clearFilters}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Sales Transactions</h2>
          <p className="text-sm text-gray-600">
            Showing {pagination.totalSales} total sales
          </p>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              <span className="ml-2">Loading sales...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>Error: {error}</span>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sales found for the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sale.saleNumber}</div>
                            <div className="text-sm text-gray-500">{formatDate(sale.saleDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {sale.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {item.product?.name || 'Unknown Product'}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (Qty: {item.quantity} × {formatPrice(item.unitPrice)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {sale.createdBy?.fullName || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {sale.paymentMethod.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{formatPrice(sale.totalAmount)}</div>
                          {sale.items.length > 1 && (
                            <div className="text-xs text-gray-500">{sale.items.length} items</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchSales(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => fetchSales(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
