import { useState } from "react";
import logo from "../assets/images/Your paragraph text.png";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ isOpen, onClose }) {
  const [active, setActive] = useState("Dashboard");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  }

  const handleLogout = () => {
    // Optional confirmation
    // const confirmLogout = window.confirm("Are you sure you want to log out?");
    // if (!confirmLogout) return;
  
    // Remove stored tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Remove stored user info as well
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/");
  };
  const handleItemClick = (name,path) => {
    setActive(name);
    setOpenDropdown(null);
    onClose(); // ✅ Close sidebar after clicking (mobile)
    if (path) navigate(path);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r-2 border-[#F8961E] flex flex-col justify-between shadow-md transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        {/* ✅ Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-white">
          <img
            src={logo}
            alt="ATTN Logo"
            className="w-14 h-14 rounded-xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#F8961E] leading-tight">
              ATTN
            </h1>
            <p className="text-gray-700 text-sm tracking-wide">STORE</p>
          </div>
        </div>

        {/* ✅ Menu Section */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-6 mt-6 text-sm text-gray-500 font-semibold tracking-wider">
            MENU
          </p>

          <ul className="mt-3 space-y-2 px-4">
            {/* 🟧 Dashboard */}
            <li>
              <button
                onClick={() => handleItemClick("Dashboard", "/dashboard")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                  active === "Dashboard"
                    ? "bg-[#F8961E] text-white shadow-md scale-[1.02]"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    active === "Dashboard" ? "text-white" : "text-gray-800"
                  }`}
                >
                  <path
                    fill="currentColor"
                    d="M13 9V3h8v6zM3 13V3h8v10zm10 8V11h8v10zM3 21v-6h8v6z"
                  />
                </svg>
                <span className="font-medium text-lg">Dashboard</span>
              </button>
            </li>

            {/* 🟧 Transaction Dropdown */}
            <li>
              <button
                onClick={() => toggleDropdown("Transaction")}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  openDropdown === "Transaction"
                    ? "bg-[#F8961E] text-white shadow-md scale-[1.02]"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <path
                      fill="currentColor"
                      d="M10 5.5a4.5 4.5 0 0 1 6.5-4.032a4.5 4.5 0 1 1 0 8.064A4.5 4.5 0 0 1 10 5.5m8.25 2.488q.123.012.25.012a2.5 2.5 0 1 0-.25-4.988A4.5 4.5 0 0 1 19 5.5a4.5 4.5 0 0 1-.75 2.488M8.435 13.25a1.25 1.25 0 0 0-.885.364l-2.05 2.05V19.5h5.627l5.803-1.45l3.532-1.508a.555.555 0 0 0-.416-1.022l-.02.005L13.614 17H10v-2h3.125a.875.875 0 1 0 0-1.75z"
                    />
                  </svg>
                  <span className="font-medium text-lg">Transaction</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openDropdown === "Transaction" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "Transaction" && (
                <ul className="ml-10 mt-2 space-y-2 text-gray-700">
                  <li>
                    <button
                      onClick={() => handleItemClick("Order Product","/transaction_order_product")}
                      className="hover:text-[#F8961E]"
                    >
                      Order Product
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleItemClick("Transaction List", "/transaction-list")}
                      className="hover:text-[#F8961E]"
                    >
                      Transaction List
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleItemClick("E-Wallet Transaction","/transaction_ewallet")
                      }
                      className="hover:text-[#F8961E]"
                    >
                      E-Wallet Transaction
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleItemClick("E-Wallet Transaction History","/transaction_ewallet_history")
                      }
                      className="hover:text-[#F8961E] text-left"
                    >
                      E-Wallet Transaction List
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        handleItemClick("Debt list","/debt_list")
                      }
                      className="hover:text-[#F8961E] text-left"
                    >
                      Debt List
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 🟧 Inventory */}
            <li>
              <button
                onClick={() => toggleDropdown("Inventory")}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  openDropdown === "Inventory"
                    ? "bg-[#F8961E] text-white shadow-md scale-[1.02]"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    active === "Inventory" ? "text-white" : "text-gray-800"
                  }`}
                >
                  <path
                    fill=""
                    d="M4 4h16v2H4zm2 4h12v12H6zm2 2v8h8v-8z"
                  />
                </svg>
                  <span className="font-medium text-lg">Inventory</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openDropdown === "Inventory" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "Inventory" && (
                <ul className="ml-10 mt-2 space-y-2 text-gray-700">
                  <li>
                    <button
                      onClick={() => handleItemClick("Add Product","/inventory_add_product")}
                      className="hover:text-[#F8961E]"
                    >
                      Add Product
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleItemClick("Product List", "/inventory_product_list")}
                      className="hover:text-[#F8961E]"
                    >
                      Product List
                    </button>
                  </li>
                  
                </ul>
              )}
            </li>
            {/* 🟧 Analytics */}
            <li>
              <button
                onClick={() => handleItemClick("Analytics","/analytics")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  active === "Analytics"
                    ? "bg-[#F8961E] text-white shadow-md scale-[1.02]"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 ${
                    active === "Analytics" ? "text-white" : "text-gray-800"
                  }`}
                >
                  <path
                    fill="currentColor"
                    d="M3 17h2v4H3zm4-6h2v10H7zm4 4h2v6h-2zm4-8h2v14h-2zm4 10h2v4h-2z"
                  />
                </svg>
                <span className="font-medium text-lg">Analytics</span>
              </button>
            </li>
          </ul>
        </div>
                  
        {/* ✅ Logout Button */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <button onClick={openLogoutModal} className="w-full flex items-center justify-center gap-2 border-2 border-[#F8961E] text-[#F8961E] bg-white font-semibold py-2.5 rounded-lg shadow-md transition-transform duration-150 hover:bg-[#F8961E] hover:text-white active:scale-95">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-5 h-5 fill-current"
            >
              <path d="M160 96c17.7 0 32-14.3 32-32S177.7 32 160 32L96 32C43 32 0 75 0 128V384c0 53 43 96 96 96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32h64zm342.6 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224H192c-17.7 0-32 14.3-32 32s14.3 32 32 32h210.7l-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
            </svg>
            Logout
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            © 2025 ATTN Store
          </p>
        </div>
      </aside>

      {/* ✅ Overlay (click outside to close sidebar on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[999]">
              <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">

                <h2 className="text-lg font-bold text-[#4D1C0A] mb-3">
                  Confirm Log out
                </h2>

                <p className="text-gray-700 mb-5">
                  Are you sure you want to log out?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className="px-4 py-2 rounded-lg bg-[#EA6464]  text-white hover:bg-red-700"
                  >
                    Log Out
                  </button>
                </div>

              </div>
            </div>
      )}

    </>
  );
}

export default Navbar;
