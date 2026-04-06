import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye } from "lucide-react";

function TransactionList() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);

  // ------------------------------
  // INITIAL ORDER FETCH
  // ------------------------------
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/orders/")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  // ------------------------------
  // 🔥 LIVE AUTO-REFRESH EVERY 2 SECONDS
  // ------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:8000/api/orders/")
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch((err) => console.error("Live update failed:", err));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------
  // OPEN MODAL + FETCH ITEMS
  // ------------------------------
  const viewOrderDetails = async (order) => {
    if (!order || !order.order_id) {
      console.error("Invalid order selected", order);
      alert("Unable to view order: invalid order data.");
      return;
    }

    setSelectedOrder(order);
    setOrderItems([]);
    setOrderItemsLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/orders/${order.order_id}/items/`
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed fetching order items:", res.status, text);
        alert("Failed to load order items. See console for details.");
        setOrderItemsLoading(false);
        return;
      }

      const data = await res.json();
      setOrderItems(data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching order items:", err);
      alert("Network error while loading order items.");
    } finally {
      setOrderItemsLoading(false);
    }
  };

  // ------------------------------
  // SEARCH + FILTER
  // ------------------------------
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.cus_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.order_id?.toString().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "" || selectedStatus === "All"
        ? true
        : o.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">
        Transaction List
      </h1>

      <div className="rounded-xl p-6 shadow-lg bg-gradient-to-br from-white to-gray-50">

        {/* HEADER */}
        <div className="border-b pb-2 border-[#4D1C0A] mb-4">
          <h2 className="font-semibold text-lg text-[#4D1C0A]">Orders</h2>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 border border-gray-300 rounded-lg py-1.5 px-3 text-gray-800 bg-white"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm cursor-pointer shadow-sm flex items-center gap-2"
            >
              {selectedStatus || "All Status"}
              <ChevronDown className="w-4 h-4 ml-1" />
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-lg bg-white rounded-lg w-36 mt-2 border border-gray-200 text-gray-500"
            >
              <li><a onClick={() => setSelectedStatus("All")}>All</a></li>
              <li><a onClick={() => setSelectedStatus("Paid")}>Paid</a></li>
              <li><a onClick={() => setSelectedStatus("Pending")}>Pending</a></li>
            </ul>
          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-y-auto max-h-[520px] mt-4 rounded-lg bg-white shadow-inner">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="bg-gray-50 border-b sticky top-0 z-10">
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Order ID</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Status</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Customer</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Contact</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Total</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Due Date</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Order Date</th>
                <th className="px-4 py-3 text-sm text-gray-600 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray-400 py-6">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-gray-50 transition">

                    <td className="px-4 py-3 text-gray-800 font-medium text-center">
                      {o.order_id}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded 
                          ${
                            o.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-center">
                      {o.cus_name || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-center">
                      {o.contact_num || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-center">
                      ₱{o.total_amt}
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-center">
                      {o.due_date || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-center">
                      {o.order_date}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-[#F8961E] text-white 
                        hover:bg-[#e7891b] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        onClick={() => viewOrderDetails(o)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[650px] rounded-xl p-6 shadow-xl relative">

            <button
              className="absolute top-3 right-4 text-xl text-gray-600 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-[#4D1C0A] mb-4">
              Order Details
            </h2>

            <div className="space-y-2 text-gray-700 mb-4">
              <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
              <p><strong>Status:</strong> 
                <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                  ${
                    selectedOrder.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {selectedOrder.status}
                </span>
              </p>

              <p><strong>Customer:</strong> {selectedOrder.cus_name || "N/A"}</p>
              <p><strong>Contact:</strong> {selectedOrder.contact_num || "N/A"}</p>
              <p><strong>Total Amount:</strong> ₱{selectedOrder.total_amt}</p>
              <p><strong>Due Date:</strong> {selectedOrder.due_date || "N/A"}</p>
              <p><strong>Order Date:</strong> {selectedOrder.order_date}</p>
            </div>

            <hr className="my-3" />

            <h3 className="text-lg font-bold text-[#4D1C0A] mb-2">
              Ordered Items
            </h3>

            <div className="max-h-[240px] overflow-y-auto border rounded-lg">
              <table className="table table-sm w-full text-gray-700">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2">{item.qty}</td>
                      <td className="px-3 py-2">₱{item.selling_price}</td>
                      <td className="px-3 py-2 font-semibold">₱{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default TransactionList;
