import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import TransactionList from "./pages/transaction-list";
import PrivateRoute from "./utility/PrivateRoute";
import Login from "./pages/login";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import OrderProduct from "./pages/transaction_order_product";
import AddProduct from "./pages/inventory_add_product";
import Ewallet from "./pages/transaction_ewallet";
import EwalletHistory from "./pages/transaction_ewallet_history";
import ProductList from "./pages/inventory_product_list";
import EditProduct from "./pages/inventory_edit_product";
import Signup from "./pages/signup";
import DebtList from "./pages/debt_list";
import DebtTransactions from "./pages/debt_transactions";


import "./App.css";
import Analytics from "./pages/analytics";
import EditProfile from "./pages/editprofile";

import "./App.css";


// ----------------------------------------------------
// LAYOUT (Fixed infinite loop)
// ----------------------------------------------------
function Layout({ children, isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    const titles = {
      "/dashboard": "Dashboard",
      "/transaction-list": "Transaction History",
      "/transaction_order_product": "Order Product",
      "/transaction_ewallet": "E-Wallet",
      "/transaction_ewallet_history": "Wallet History",
      "/inventory_add_product": "Add Product",
      "/inventory_product_list": "Product List",
      "/inventory_edit_product": "Edit Product",
      "/analytics": "Analytics",
      "/editprofile": "Edit Profile",
    };

    const newTitle = titles[location.pathname] || "ATTN Store";
    setPageTitle(newTitle);
    document.title = newTitle;
  }, [location.pathname]); // ✅ fixed

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Topbar + content */}
      <main className="flex-1 transition-all duration-300 lg:ml-72">
        <div className="sticky top-0 bg-white shadow-sm z-50">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} pageTitle={pageTitle} />
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}


// ----------------------------------------------------
// APP ROUTES
// ----------------------------------------------------
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/ATTN_Backend/web_desc/")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setMessage(JSON.stringify(data.recipes, null, 2)))
      .catch(() => setMessage("Failed to load recipes."));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transaction_order_product"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <OrderProduct />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transaction-list"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <TransactionList />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transaction_ewallet"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <Ewallet />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/inventory_add_product"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <AddProduct />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/inventory_product_list"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <ProductList />
              </Layout>
            </PrivateRoute>
          }
        />

<Route
  path="/inventory_edit_product/:id"
  element={
    <PrivateRoute>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <EditProduct />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/transaction_ewallet_history"
  element={
    <PrivateRoute>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <EwalletHistory />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/debt_list"
  element={
    <PrivateRoute>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <DebtList />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/analytics"
  element={
    <PrivateRoute>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <Analytics />
      </Layout>
    </PrivateRoute>
  }
/>

<Route path="/debt-transaction/:customerName" element={ <PrivateRoute>
      <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <DebtTransactions />
      </Layout>
    </PrivateRoute>} />

        <Route
          path="/inventory_edit_product/:id"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <EditProduct />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transaction_ewallet_history"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <EwalletHistory />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <Analytics />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Edit Profile Route */}
        <Route
          path="/editprofile"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
                <EditProfile />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
