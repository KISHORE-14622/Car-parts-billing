import React from 'react';
import { Link } from 'react-router-dom';
import { Package, DollarSign, Wrench, Calendar } from 'lucide-react';

const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    description,
    category,
    price,
    stock,
    manufacturer,
    partNumber,
    image,
    compatibility,
    createdAt
  } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  const stockStatus = getStockStatus(stock);

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 animate-fade-in">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Package className="h-16 w-16" />
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`badge ${stockStatus.color} text-xs font-medium`}>
            {stockStatus.text}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="badge-primary text-xs">
            {typeof category === 'object' ? category?.name : category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="card-content">
        <div className="space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>

          {/* Manufacturer & Part Number */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <Wrench className="h-4 w-4" />
              <span>{manufacturer}</span>
            </span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {partNumber}
            </span>
          </div>

          {/* Compatibility */}
          {compatibility && compatibility.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Fits: </span>
              <span>
                {compatibility.slice(0, 2).map((comp, index) => (
                  <span key={index}>
                    {comp.make} {comp.model} ({comp.year})
                    {index < Math.min(compatibility.length, 2) - 1 ? ', ' : ''}
                  </span>
                ))}
                {compatibility.length > 2 && (
                  <span className="text-primary-600"> +{compatibility.length - 2} more</span>
                )}
              </span>
            </div>
          )}

          {/* Price and Stock */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xl font-bold text-green-600">
                {formatPrice(price)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{stock}</span> in stock
            </div>
          </div>

          {/* Added Date */}
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Added {formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link
            to={`/product/${_id}`}
            className="btn-primary w-full text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
