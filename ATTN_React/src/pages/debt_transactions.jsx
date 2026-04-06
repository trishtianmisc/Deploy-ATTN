import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { useParams } from "react-router-dom";

function DebtTransactions() {
  const { customerName } = useParams();
  const [orders, setOrders] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  // Payment Input
  const [paymentAmount, setPaymentAmount] = useState("");

  // ------------------------------
  // Fetch Payments
  // ------------------------------
  const fetchCustomerPayments = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/debtpayments/?customer=${customerName}`
      );
      const data = await res.json();
      setCustomerPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // ------------------------------
  // Fetch Orders
  // ------------------------------
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders/");
      const data = await res.json();

      // Filter by customer
      const customerOrders = data.filter(
        (o) => o.cus_name === customerName && o.status === "Pending"
      );

      // Calculate remaining balance for each order
      const ordersWithBalance = customerOrders.map((order) => {
        const paidAmount = customerPayments
          .filter((p) => p.order === order.order_id)
          .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        return { ...order, remaining_amt: order.total_amt - paidAmount };
      });

      setOrders(ordersWithBalance);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchCustomerPayments();
  }, [customerName]);

  useEffect(() => {
    fetchOrders();
  }, [customerPayments]);

  // ------------------------------
  // Update Order Status
  // ------------------------------
 

  // ------------------------------
  // View Order Details
  // ------------------------------
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);

    fetch(`http://127.0.0.1:8000/api/orders/${order.order_id}/items/`)
      .then((res) => res.json())
      .then((data) => {
        setOrderItems(data);
        setShowModal(true);
      })
      .catch((err) => console.error("Error fetching items:", err));
  };

  // ------------------------------
  // Confirm Payment
  // ------------------------------
  const handleConfirmPayment = async () => {
  const amount = parseFloat(paymentAmount);
  if (!amount || amount <= 0) {
    // alert("Enter a valid payment amount");
    // return;
    setNotification({
      show: true,
      message: "Please enter a valid payment amount.",
      type: "error",
    });
    setTimeout(()=> 
      setNotification({ show: false, message: "", type: "success"}), 3000);
    return;
  }

  const paidAmount = customerPayments
    .filter((p) => p.order === selectedOrder.order_id)
    .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

  const remaining = selectedOrder.total_amt - paidAmount;

  if (amount > remaining) {
    // alert(`Payment exceeds remaining balance. Remaining: ₱${remaining.toFixed(2)}`);
    // return;
    setNotification({
      show: true,
      message: `Payment exceeds remaining balance. Remaining: ₱${remaining.toFixed(2)}`,
      type: "error",
    });
    setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
    return;
  }

  try {
    await fetch("http://127.0.0.1:8000/api/debtpayments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cus_name: customerName,
        order: selectedOrder.order_id,
        amount_paid: amount,
        date: new Date().toISOString().split("T")[0],
      }),
    });

    await fetchCustomerPayments();
    const newRemaining = remaining - amount;

    if (newRemaining <= 0) {
      await fetch(
        `http://127.0.0.1:8000/api/orders/${selectedOrder.order_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Paid" }),
        }
      );
      // alert("Payment recorded and order marked as Paid!");
      setNotification({
        show: true,
        message: "Payment recorded and order marked as Paid!",
        type: "success",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
      
    } else {
      // alert("Payment recorded successfully!");
      setNotification({
        show: true,
        message: "Payment recorded successfully!",
        type: "success",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
    }

    setPaymentAmount("");

    // ✅ Close the modal after success
    setShowModal(false);
    setSelectedOrder(null);

    fetchOrders();
  } catch (err) {
    console.error("Error recording payment:", err);
    alert("Failed to record payment.");
  }
};



  // ------------------------------
  // All Paid Button
  // ------------------------------
  const handleAllPaid = async () => {
    if (!orders || orders.length === 0) {
      // alert("No pending orders to mark as paid.");
      // return;
      setNotification({
        show: true,
        message: "No pending orders to mark as paid.",
        type: "error",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
      return;
    }

    try {
      for (const order of orders) {
        const remainingAmount = order.remaining_amt;
        if (remainingAmount <= 0) continue;

        // Insert payment
        await fetch("http://127.0.0.1:8000/api/debtpayments/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cus_name: customerName,
            order: order.order_id,
            amount_paid: remainingAmount,
            date: new Date().toISOString().split("T")[0],
          }),
        });

        // Update order status
        await fetch(`http://127.0.0.1:8000/api/orders/${order.order_id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Paid" }),
        });
      }

      // alert("All pending orders marked as Paid!");
      setNotification({
        show: true,
        message: "All pending orders marked as Paid!",
        type: "success",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);

      await fetchCustomerPayments();
      await fetchOrders();
    } catch (err) {
      console.error("Error marking all paid:", err);
      alert("Failed to mark all orders as paid.");
    }
  };

  // ------------------------------
  // Filter Orders
  // ------------------------------
  const filteredOrders = orders.filter((o) => {
    return (
      o.order_id?.toString().includes(searchTerm) ||
      o.order_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.due_date?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // ------------------------------
  // Total Pending Debt
  // ------------------------------
  const totalPending = filteredOrders.reduce(
    (sum, o) => sum + parseFloat(o.remaining_amt || 0),
    0
  );

  return (
    <>
    {notification.show && (
      <div className="fixed top-5 right-5 z-[9999]">
          <div
            className={`max-w-sm px-4 py-3 rounded-lg shadow-md text-white flex items-center justify-between space-x-4 ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex-1">{notification.message}</div>
            
          </div>
        </div>
    )}
    <div className="p-3">
      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">
        {customerName}'s Debt Transactions
      </h1>

      {/* Total Pending */}
      <div className="mt-2 mb-4 p-4 bg-white shadow-md rounded-lg border-l-4 border-[#F8961E]">
        <p className="text-lg font-semibold text-[#4D1C0A]">
          Total Pending Debt:{" "}
          <span className="text-red-600">₱{totalPending.toFixed(2)}</span>
        </p>
      </div>

      {/* All Paid Button */}
      <div className="mb-4">
        <button
          className="rounded-lg font-semibold px-4 py-3 bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAllPaid}
        >
          Complete Payment
        </button>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl p-6 shadow-lg bg-gradient-to-br from-white to-gray-50 mt-4">
        <div className="border-b pb-2 border-[#4D1C0A] mb-4">
          <h2 className="font-semibold text-lg text-[#4D1C0A]">
            Pending Transactions
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10 border border-gray-300 rounded-lg py-1.5 px-3 text-gray-800 bg-white"
          />
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[520px] mt-4 rounded-lg bg-white shadow-inner">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="text-left bg-gray-50 border-b">
                <th className="px-4 py-3 text-sm text-gray-600">Order ID</th>
                <th className="px-4 py-3 text-sm text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm text-gray-600">Remaining</th>
                <th className="px-4 py-3 text-sm text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-sm text-gray-600">Order Date</th>
                <th className="px-4 py-3 text-sm text-gray-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 py-6">
                    No pending transactions found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-800">{o.order_id}</td>
<td className="px-4 py-3 ">
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
                       

                    <td className="px-4 py-3 text-gray-800">
                      ₱{o.remaining_amt.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{o.due_date}</td>
                    <td className="px-4 py-3 text-gray-800">{o.order_date}</td>
                    <td className="px-4 py-3">
                      <button
                        className="btn btn-xs bg-[#F8961E] text-white hover:bg-[#d97d17] shadow-sm border-0"
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

      {/* Payments History */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
        <h3 className="font-semibold text-gray-700 mb-2">Payments Made</h3>
        {customerPayments.filter((p) => p.cus_name === customerName).length === 0 ? (
          <p className="text-gray-400">No payments yet.</p>
        ) : (
          <ul className="space-y-1">
            {customerPayments
              .filter((p) => p.cus_name === customerName)
              .map((p) => (
                <li key={p.id} className="text-gray-500">
                  ₱{p.amount_paid} on {p.date} (Order ID: {p.order})
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[650px] rounded-xl p-6 shadow-xl relative">
            <button
              className="absolute top-3 right-4 text-xl font-bold text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-[#4D1C0A] mb-4">
              Order Details
            </h2>

            <div className="space-y-2 text-gray-700 mb-4">
              <p>
                <strong>Order ID:</strong> {selectedOrder.order_id}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Remaining Amount:</strong> ₱
                {selectedOrder.remaining_amt.toFixed(2)}
              </p>
              <p>
                <strong>Due Date:</strong> {selectedOrder.due_date}
              </p>
              <p>
                <strong>Order Date:</strong> {selectedOrder.order_date}
              </p>
            </div>

            <hr className="my-3" />

            <h3 className="text-lg font-bold text-[#4D1C0A] mb-2">
              Ordered Items
            </h3>
            <div className="max-h-[240px] overflow-y-auto border rounded-lg">
              <table className="table table-sm w-full text-gray-700">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-3 py-2 text-gray-800">Product</th>
                    <th className="px-3 py-2 text-gray-800">Category</th>
                    <th className="px-3 py-2 text-gray-800">Qty</th>
                    <th className="px-3 py-2 text-gray-800">Price</th>
                    <th className="px-3 py-2 text-gray-800">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2 text-center">{item.qty}</td>
                      <td className="px-3 py-2">₱{item.selling_price}</td>
                      <td className="px-3 py-2 font-semibold">₱{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Section */}
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-bold text-[#4D1C0A] mb-2">Make Payment</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="border rounded px-3 py-1 border border-gray-400 text-gray-700"
                />
                <button
                  className="rounded-lg bg-green-600 text-white px-4 py-2 font-semibold"
                  onClick={handleConfirmPayment}
                >
                  Confirm
                </button>
              </div>
            </div>

        
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default DebtTransactions;
