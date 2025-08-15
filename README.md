# Car Parts Barcode Scanner

A full-stack web application for car parts sellers that enables barcode scanning and product management. Built with React + Vite frontend, Express.js backend, and MongoDB database.

## Features

- **Barcode Scanning**: Use device camera or manual input to scan product barcodes
- **Product Catalog**: Browse extensive car parts inventory with search and filtering
- **Real-time Inventory**: Live stock updates and availability status
- **Product Details**: Comprehensive product information including specifications and compatibility
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, professional interface built with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **@zxing/library** - Barcode scanning functionality
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
car-parts-barcode-scanner/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context for state management
│   │   └── ...
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── config/             # Configuration files
│   ├── data/               # Sample data
│   ├── scripts/            # Utility scripts
│   └── package.json
├── package.json            # Root package.json with scripts
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd car-parts-barcode-scanner
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/car_parts_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 4. Database Setup
```bash
# Seed the database with sample car parts data
cd backend
npm run seed
```

### 5. Start the Application
```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Backend (from root directory)
npm run server

# Frontend (from root directory)
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Products
- `GET /api/products` - Get all products with pagination and filtering
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)
- `GET /api/products/categories/list` - Get all categories

### Query Parameters
- `page` - Page number for pagination
- `limit` - Number of items per page
- `search` - Search term for products
- `category` - Filter by category

## Sample Barcodes for Testing

The application comes with sample car parts data. You can test the barcode scanner with these codes:

- `1234567890123` - Brake Pads - Front Set
- `2345678901234` - Engine Oil Filter
- `3456789012345` - Spark Plugs Set (4 pieces)
- `4567890123456` - Air Filter
- `5678901234567` - Timing Belt

## Usage

### Scanning Barcodes
1. Navigate to the Scanner page
2. Allow camera permissions when prompted
3. Point your camera at a barcode or enter it manually
4. View instant product information

### Browsing Products
1. Go to the Products page
2. Use search and filters to find specific parts
3. Click on any product for detailed information
4. View specifications, compatibility, and pricing

### Product Categories
- Engine Parts
- Brake System
- Suspension
- Electrical
- Body Parts
- Filters
- Belts & Hoses
- Transmission
- Cooling System
- Exhaust System

## Development

### Adding New Products
Products can be added through the API or by modifying the sample data in `backend/data/sampleProducts.js`.

### Customizing the UI
The frontend uses Tailwind CSS for styling. Modify the components in `frontend/src/components/` and pages in `frontend/src/pages/`.

### Database Schema
The product schema includes:
- Basic info (name, description, price, stock)
- Barcode and part number
- Category and manufacturer
- Vehicle compatibility
- Specifications (weight, dimensions, material, warranty)
- Timestamps and status

## Deployment

### Frontend (Vite Build)
```bash
cd frontend
npm run build
```

### Backend (Production)
```bash
cd backend
npm start
```

### Environment Variables for Production
Update the `.env` file with production values:
- MongoDB Atlas connection string
- Secure JWT secret
- Production API URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for the automotive industry
