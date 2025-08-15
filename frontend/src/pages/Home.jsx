import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Package, Search, Zap, Shield, Clock } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Scan,
      title: 'Barcode Scanning',
      description: 'Instantly scan product barcodes to get detailed information about car parts.',
      color: 'text-blue-600'
    },
    {
      icon: Package,
      title: 'Extensive Inventory',
      description: 'Browse through thousands of car parts from various manufacturers.',
      color: 'text-green-600'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find parts by name, manufacturer, part number, or vehicle compatibility.',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Quick access to product information with real-time inventory updates.',
      color: 'text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'All parts come with manufacturer warranties and quality guarantees.',
      color: 'text-red-600'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access product information anytime, anywhere with our web application.',
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    { label: 'Car Parts', value: '10,000+' },
    { label: 'Manufacturers', value: '50+' },
    { label: 'Categories', value: '10+' },
    { label: 'Daily Scans', value: '500+' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 text-shadow">
            Car Parts
            <span className="gradient-text"> Barcode Scanner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Instantly identify and get detailed information about car parts using our advanced barcode scanning technology. 
            Perfect for mechanics, parts dealers, and car enthusiasts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
          <Link to="/scanner" className="btn-primary btn-ripple text-lg px-8 py-4 shadow-lg">
            <Scan className="h-5 w-5 mr-2" />
            Start Scanning
          </Link>
          <Link to="/products" className="btn-outline text-lg px-8 py-4">
            <Package className="h-5 w-5 mr-2" />
            Browse Products
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="glass-effect rounded-2xl shadow-lg p-8 animate-slide-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl font-bold gradient-text mb-2 group-hover:animate-bounce-subtle">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose Our Scanner?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our barcode scanner application is designed specifically for the automotive industry, 
            providing accurate and comprehensive part information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="interactive-card group">
              <div className="card-content">
                <div className="space-y-4">
                  <div className={`${feature.color} w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Scan Barcode
            </h3>
            <p className="text-gray-600">
              Use your device's camera to scan the barcode on any car part
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Get Information
            </h3>
            <p className="text-gray-600">
              Instantly receive detailed product information, pricing, and compatibility
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Make Decisions
            </h3>
            <p className="text-gray-600">
              Use the information to make informed purchasing or inventory decisions
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white rounded-2xl p-12 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 animate-pulse-slow"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-shadow">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who trust our barcode scanner for accurate car parts identification.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/scanner" className="bg-white text-primary-600 hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 btn btn-ripple text-lg px-8 py-4 transition-all duration-300">
              <Scan className="h-5 w-5 mr-2" />
              Try Scanner Now
            </Link>
            <Link to="/products" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 hover:shadow-lg hover:-translate-y-1 btn text-lg px-8 py-4 transition-all duration-300">
              <Package className="h-5 w-5 mr-2" />
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
