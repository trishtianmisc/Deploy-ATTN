import { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import store_logo from "../assets/images/processed_image.png";
import {
  ShoppingCart,
  BarChart3,
  Package,
  Wallet,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import logo from "../assets/images/Your paragraph text.png";
import API_URL from "../utility/API_Url";


export default function Landing() {
  const navigate = useNavigate();
  const [numprod, setNumprod] = useState(0);
  const [numOrders, setNumOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/ordereditem/`)
      .then(res => res.json())
      .then(data => {
        const thisMonth = new Date().getMonth() + 1;
        const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;

        let thisMonthSales = 0;
        let lastMonthSales = 0;

        data.forEach(item => {
          const d = new Date(item.order_date);
          const sales = item.qty * item.selling_price;

          if (d.getMonth() + 1 === thisMonth) thisMonthSales += sales;
          if (d.getMonth() + 1 === lastMonth) lastMonthSales += sales;
        });

        const growth =
          lastMonthSales > 0
            ? (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1)
            : 100;

        setMonthlyGrowth(growth);
      });
  }, []);


  useEffect(() => {
    fetch(`${API_URL}/api/ordereditem/`)
      .then((res) => res.json())
      .then((data) => {
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayYear = today.getFullYear();
        const todayDate = today.getDate();

        const todaysItems = data.filter(item => {
          if (!item.order_date) return false;
          const d = new Date(item.order_date);
          return (
            d.getDate() === todayDate &&
            d.getMonth() + 1 === todayMonth &&
            d.getFullYear() === todayYear
          );
        });

        // Today's Sales (₱)
        const sales = todaysItems.reduce(
          (sum, item) =>
            sum +
            parseFloat(item.selling_price || 0) * (item.qty || 0),
          0
        );
        setTodaySales(sales);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/orders/`)
      .then((res) => res.json())
      .then((data) => {
        setNumOrders(data.length);
      })
      .catch((err) => console.error("Error fetching orders: ", err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/products/`)
      .then((res) => res.json())
      .then((data) => {
        setNumprod(data.length);
      })
      .catch((err) => console.error("Error fetching products: ", err));
  }, []);

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Order Management",
      description: "Streamline your sales process with intuitive order tracking and management tools."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Insights",
      description: "Make data-driven decisions with real-time analytics and predictive sales forecasting."
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Inventory Control",
      description: "Keep track of stock levels, manage products, and get automated restock recommendations."
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "E-Wallet Integration",
      description: "Seamless digital payment processing with integrated e-wallet functionality."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Sales Forecasting",
      description: "AI-powered predictions help you anticipate demand and optimize inventory."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Your business data is protected with enterprise-grade security measures."
    }
  ];

  const benefits = [
    "Real-time inventory tracking",
    "Automated stock alerts",
    "Sales analytics dashboard",
    "Multi-payment support",
    "Mobile-responsive design",
    "24/7 system availability"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-[#F8961E]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="ATTN Logo"
                className="w-12 h-12 object-cover rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold text-[#4D1C0A]">ATTN</h1>
                <p className="text-xs text-[#F8961E] font-semibold">STORE</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-[#F8961E] text-white font-semibold rounded-lg hover:bg-[#e8850d] transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FBEED7] via-white to-[#FBEED7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#4D1C0A] mb-6 leading-tight">
                ATTN
                <span className="block text-[#F8961E]">Variety Store</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Access your dashboard to manage products, orders, and store performance.
                Track inventory, analyze sales, and grow your business with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-[#F8961E] text-white font-bold rounded-lg hover:bg-[#e8850d] transition-all duration-300 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>

              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#F8961E] to-[#C53B09] rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#FBEED7] rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Today's Sales</p>
                        <p className="text-2xl font-bold text-[#4D1C0A]">₱ {todaySales.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-[#F8961E]" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#FBEED7] rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Products</p>
                        <p className="text-2xl font-bold text-[#4D1C0A]">{numprod}</p>
                      </div>
                      <Package className="w-8 h-8 text-[#F8961E]" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#FBEED7] rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Orders</p>
                        <p className="text-2xl font-bold text-[#4D1C0A]">{numOrders}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-[#F8961E]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#4D1C0A] mb-4">
              Store Operations at a Glance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help manage the variety store efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-white to-[#FBEED7] rounded-xl border border-[#F8961E]/20 hover:shadow-xl transition-all duration-300 hover:border-[#F8961E] group"
              >
                <div className="w-16 h-16 bg-[#F8961E] rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#4D1C0A] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FBEED7] to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#4D1C0A] mb-6">
                ATTN Store Management System
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                A streamlined system designed to make daily operations faster, clearer, and more efficient.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#F8961E] flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-gray-200">
              <img
                src={store_logo}
                alt="Store"
                className="rounded-xl w-full h-auto object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#F8961E] to-[#C53B09]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to See Store Performance?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Access your dashboard to manage products, orders, and store performance.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 bg-white text-[#4D1C0A] font-bold rounded-lg hover:bg-[#FBEED7] transition-all duration-300 shadow-xl hover:shadow-2xl text-lg flex items-center gap-2 mx-auto"
          >
            Sign In Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4D1C0A] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={logo}
                  alt="ATTN Logo"
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-lg">ATTN</h3>
                  <p className="text-xs text-[#F8961E]">STORE</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Complete store management solution for modern variety stores.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => navigate("/login")} className="hover:text-[#F8961E] transition">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/signup")} className="hover:text-[#F8961E] transition">
                    Create Account
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-[#F8961E] transition cursor-pointer">Order Management</li>
                <li className="hover:text-[#F8961E] transition cursor-pointer">Inventory Control</li>
                <li className="hover:text-[#F8961E] transition cursor-pointer">Analytics Dashboard</li>
                <li className="hover:text-[#F8961E] transition cursor-pointer">E-Wallet Integration</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 ATTN Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



