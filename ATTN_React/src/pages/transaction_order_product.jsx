import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const toTitleCase = (str) =>
  str && typeof str === "string"
    ? str.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.substr(1).toLowerCase())
    : "";

function OrderProduct() {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    dueDate: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch("http://localhost:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((p) => ({
          id: p.id,
          name: toTitleCase(p.name),
          category: p.category?.name ? toTitleCase(p.category.name) : "Uncategorized",
          selling_price: Number(p.selling_price),
          cost_price: Number(p.cost_price),
          stock: p.stock,
          checked: false,
        }));
        setProducts(formatted);
      })
      .catch((err) => console.error("Loading products failed:", err));
  }, []);

  const handleCheckboxChange = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleAddSelectedToOrder = () => {
    const selected = products.filter((p) => p.checked);

    if (selected.length === 0) {
      showAlert("Please select at least one product.", "error");
      return;
    }

    const outOfStock = selected.filter((p) => p.stock === 0);
    if (outOfStock.length > 0) {
      showAlert("Some selected products are OUT OF STOCK.", "error");
      return;
    }

    const newItems = selected
      .filter((p) => !orderItems.some((item) => item.id === p.id))
      .map((p) => ({ ...p, qty: 1 }));

    setOrderItems([...orderItems, ...newItems]);
    setProducts((prev) => prev.map((p) => ({ ...p, checked: false })));
  };

  const updateQty = (index, type) => {
    const updated = [...orderItems];

    if (type === "inc") {
      if (updated[index].qty + 1 > updated[index].stock) {
        showAlert("Not enough stock.", "error");
        return;
      }
      updated[index].qty += 1;
    }

    if (type === "dec" && updated[index].qty > 1) {
      updated[index].qty -= 1;
    }

    setOrderItems(updated);
  };

  const showAlert = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ---------------------------
  // UPDATED VALIDATION FOR PENDING
  // ---------------------------
  const submitOrder = (statusType) => {
    if (orderItems.length === 0) {
      showAlert("Please add at least one product before submitting an order.", "error");
      return;
    }

    for (let item of orderItems) {
      if (item.qty > item.stock) {
        showAlert(`Not enough stock for ${item.name}`, "error");
        return;
      }
    }

    if (statusType === "Pending") {
      if (!customerData.name || customerData.name.trim() === "") {
        showAlert("Customer name is required for Pending orders.", "error");
        return;
      }

      if (!customerData.dueDate) {
        showAlert("Due date is required for Pending orders.", "error");
        return;
      }

      if (customerData.dueDate < today) {
        showAlert("Due date cannot be in the past.", "error");
        return;
      }
    }

    const isPaid = statusType === "Paid";

    const payload = {
      status: statusType,
      cus_name: isPaid ? "N/A" : customerData.name || null,
      contact_num: isPaid ? "N/A" : customerData.phone || null,
      due_date: isPaid ? today : customerData.dueDate,
      total_amt: orderItems.reduce((sum, i) => sum + i.selling_price * i.qty, 0),

      items: orderItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        qty: item.qty,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        subtotal: item.selling_price * item.qty,
      })),
    };

    fetch("http://localhost:8000/api/create-order/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        showAlert(`Order marked as ${statusType}!`, "success");

        const updatedProducts = products.map((prod) => {
          const orderedItem = orderItems.find((item) => item.id === prod.id);
          return orderedItem
            ? { ...prod, stock: prod.stock - orderedItem.qty }
            : prod;
        });

        setProducts(updatedProducts);
        setOrderItems([]);
        setCustomerData({ name: "", phone: "", dueDate: "" });
        setShowModal(false);
      })
      .catch(() => showAlert("Failed to save order.", "error"));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* ALERT */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-[9999] animate-slideIn">
          <div
            className={`px-5 py-3 rounded-lg shadow-lg text-white flex items-center gap-3
              ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}
            `}
          >
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white p-6 rounded-xl border border-[#D9D9D9] shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#4D1C0A]">Product List</h1>

          <div className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 w-40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded-lg">
          <table className="w-full text-md text-[#4D1C0A]">
            <thead className="bg-gray-50 top-0 z-10 sticky">
              <tr>
                <th className="py-2 px-3 text-left"></th>
                <th className="py-2 px-3 text-left">Product</th>
                <th className="py-2 px-3 text-left">Category</th>
                <th className="py-2 px-3 text-left">Price</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className={`${p.stock === 0 ? "bg-red-50 text-gray-400" : "hover:bg-gray-50"}`}
                >
                  <td className="py-2 px-3 text-left">
                    <input
                      type="checkbox"
                      disabled={p.stock === 0}
                      checked={p.checked}
                      onChange={() => handleCheckboxChange(p.id)}
                    />
                  </td>

                  <td className="py-2 px-3 text-left font-medium">
                    {p.name}
                    {p.stock === 0 && (
                      <span className="text-red-500 font-semibold ml-2">
                        (Out of Stock)
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-3 text-left">{p.category}</td>
                  <td className="py-2 px-3 text-left">₱{p.selling_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAddSelectedToOrder}
            className="bg-[#F28C28] hover:bg-[#e07a1e] text-white px-4 py-2 rounded-lg shadow-sm font-bold"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white p-6 rounded-xl border border-[#D9D9D9] shadow-sm">
        <h1 className="text-xl font-bold text-[#4D1C0A] mb-4 pb-4 border-b border-[#4D1C0A]">
          Order Details
        </h1>

        <div className="rounded-lg">
          {orderItems.map((p, index) => {
            const subtotal = p.selling_price * p.qty;

            return (
              <div
                key={index}
                className="grid grid-cols-3 items-center px-4 py-3 text-gray-800"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setOrderItems(orderItems.filter((_, i) => i !== index))
                    }
                    className="w-7 h-7 flex justify-center items-center border border-red-400 text-red-500 rounded hover:bg-red-50"
                  >
                    ✕
                  </button>
                  <span>{p.name}</span>
                </div>

                <div className="flex justify-center">
                  <button className="border px-2 mr-2 rounded-lg" onClick={() => updateQty(index, "dec")}>
                    -
                  </button>
                  <span className="mx-2">{p.qty}</span>
                  <button className="border px-2 ml-2 rounded-lg" onClick={() => updateQty(index, "inc")}>
                    +
                  </button>
                </div>

                <div className="text-right font-medium">₱{subtotal}</div>
              </div>
            );
          })}
        </div>

        <div className="text-right mt-3 font-bold text-lg text-[#4D1C0A]">
          Total: ₱{orderItems.reduce((sum, p) => sum + p.selling_price * p.qty, 0)}
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#EFEFEF] text-black px-5 py-2 rounded-lg"
          >
            Pending
          </button>

          <button
            onClick={() => submitOrder("Paid")}
            className="bg-[#F28C28] text-white px-5 py-2 rounded-lg font-bold"
          >
            Paid
          </button>
        </div>
      </div>

      {/* CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white w-[600px] rounded-xl p-8 relative shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-xl font-bold text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#4D1C0A] mb-6">
              Customer Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-800">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  className="w-full border rounded-lg px-4 py-2 text-gray-800"
                  value={customerData.name}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-800">
                  Phone Number (optional)
                </label>
                <input
                  type="text"
                  placeholder="09XXXXXXXXX"
                  maxLength={11}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full border rounded-lg px-4 py-2 text-gray-800"
                  value={customerData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9]*$/.test(value)) {
                      setCustomerData({ ...customerData, phone: value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-800">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-4 py-2 text-gray-800"
                  min={today}
                  value={customerData.dueDate}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => submitOrder("Pending")}
                className="bg-[#F28C28] text-white px-10 py-3 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderProduct;
