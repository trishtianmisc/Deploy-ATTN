import { useState, useEffect } from "react";
import { Bell, User, ChevronDown, Menu, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Topbar({ onMenuClick, pageTitle }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const ordersRes = await fetch("http://127.0.0.1:8000/api/orders/");
        const orders = await ordersRes.json();

        const productsRes = await fetch("http://127.0.0.1:8000/api/products/");
        const products = await productsRes.json();

        const stockNotifications = generateStockNotifications(orders, products);
        setNotifications(stockNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------
  // SIMPLE NOTIFICATION LOGIC
  // "product is low stock — restock now"
  // ----------------------------------
  const generateStockNotifications = (orders, products) => {
    const productWeeks = {};

    orders.forEach((order) => {
      if (!order.items) return;

      order.items.forEach((item) => {
        const name = item.product_name.toLowerCase().trim();
        const qty = parseInt(item.qty) || 0;

        if (!productWeeks[name]) productWeeks[name] = { total: 0 };
        productWeeks[name].total += qty;
      });
    });

    const stockNotifications = [];

    products.forEach((product) => {
      const productName = (product.display_name || product.name).toLowerCase();
      const weeklyDemand = productWeeks[productName]?.total || 0;
      const dailyDemand = weeklyDemand / 7;

      // LOW STOCK RULE: stock < 5 OR daily demand > stock
      if (product.stock <= 5) {
        stockNotifications.push({
          id: product.id,
          productName: product.display_name || product.name,
          message: `${product.display_name || product.name} is low stock — restock now`,
        });
      }

      // Out of stock
      if (product.stock === 0) {
        stockNotifications.push({
          id: product.id,
          productName: product.display_name || product.name,
          message: `${product.display_name || product.name} is OUT OF STOCK!`,
        });
      }
    });

    return stockNotifications.reverse();

  };

  const handleNotificationClick = (productName) => {
    const encoded = encodeURIComponent(productName);
    navigate(`/analytics?product=${encoded}`);
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.length;

  return (
    <div className="h-16 bg-white shadow-md flex items-center justify-between px-4 sm:px-6 z-30 relative">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="block lg:hidden text-[#4D1C0A] p-2 rounded-md border border-[#4D1C0A]"
        >
          <Menu size={24} />
        </button>

        <h1 className="hidden lg:block text-2xl font-bold text-[#4D1C0A]">
          {pageTitle}
        </h1>
      </div>

      {/* MOBILE LOGO */}
      <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-bold text-[#F8961E]">ATTN</h1>
          <p className="text-gray-700 text-sm">STORE</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-full border border-[#4D1C0A] text-[#4D1C0A] hover:bg-[#4D1C0A]/10 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border py-3 z-40">
              <div className="px-4 pb-2 border-b flex items-center justify-between">
                <span className="text-[#4D1C0A] font-semibold text-sm">Notifications</span>
                <Bell size={16} className="text-[#4D1C0A]" />
              </div>

              {notifications.length > 0 ? (
                <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.productName)}
                      className="text-sm text-gray-700 px-3 py-2 rounded-md flex items-start gap-2 bg-[#FBEED7] cursor-pointer hover:bg-[#f6e4c0]"
                    >
                      <AlertTriangle
                        size={14}
                        className="text-red-500 mt-0.5 flex-shrink-0"
                      />
                      <span>{notif.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic px-4 py-3">
                  No notifications
                </p>
              )}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            <div className="p-2 border border-[#4D1C0A] rounded-full text-[#4D1C0A]">
              <User size={22} />
            </div>

            <span className="text-[#4D1C0A] font-medium hidden sm:block">
              {user ? `${user.first_name} ${user.last_name}` : "Guest"}
            </span>

            <ChevronDown
              size={18}
              className={`text-[#4D1C0A] transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border py-2">
              <button
                onClick={() => navigate("/editprofile")}
                className="w-full text-left px-4 py-2 text-[#4D1C0A] hover:bg-[#4D1C0A]/10"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
