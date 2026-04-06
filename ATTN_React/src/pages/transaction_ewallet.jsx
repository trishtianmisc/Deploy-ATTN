import { useState } from "react";

function Ewallet() {
  const [ewallApp, setEwallApp] = useState("");
  const [ewallType, setEwallType] = useState("");
  const [ewallAccName, setEwallAccName] = useState("");
  const [ewalNum, setEwalNum] = useState("");
  const [ewallAmount, setEwallAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Fee calculation
  const calculateFee = (amount) => {
    if (amount >= 1 && amount <= 100) return 5;
    if (amount >= 101 && amount <= 500) return 10;
    if (amount >= 501 && amount <= 1000) return 20;
    if (amount >= 1001 && amount <= 1500) return 30;
    if (amount >= 1501 && amount <= 2000) return 40;
    if (amount >= 2001 && amount <= 2500) return 50;
    if (amount >= 2501 && amount <= 3000) return 60;
    if (amount >= 3001 && amount <= 3500) return 70;
    if (amount >= 3501 && amount <= 4000) return 80;
    if (amount >= 4001 && amount <= 4500) return 90;
    if (amount >= 4501 && amount <= 5000) return 100;
    if (amount >= 5001 && amount <= 5500) return 110;
    if (amount >= 5501 && amount <= 6000) return 120;
    if (amount >= 6001 && amount <= 6500) return 130;
    if (amount >= 6501 && amount <= 7000) return 140;
    if (amount >= 7001 && amount <= 7500) return 150;
    if (amount >= 7501 && amount <= 8000) return 160;
    if (amount >= 8001 && amount <= 8500) return 170;
    if (amount >= 8501 && amount <= 9000) return 180;
    if (amount >= 9001 && amount <= 9500) return 190;
    if (amount >= 9501 && amount <= 10000) return 200;
    if (amount >= 10001 && amount <= 10500) return 210;
    return 0;
  };

  const fee = calculateFee(ewallAmount);
  const total = parseFloat(ewallAmount) + fee;

  // Validate mobile number
  const validateMobileNumber = (number) => {
    const regex = /^09\d{9}$/; // must start with 09 and 11 digits
    return regex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mobile number validation
    if (!validateMobileNumber(ewalNum)) {
      setNotification({
        show: true,
        message: "Improper mobile number. It must start with 09 and be 11 digits.",
        type: "error",
      });
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
      return;
    }

    setLoading(true);

    const payload = {
      EWALL_APP: ewallApp,
      EWALL_TYPE: ewallType,
      EWALL_ACC_NAME: ewallAccName,
      EWAL_NUM: ewalNum,
      EWALL_AMOUNT: ewallAmount,
      EWALL_FEE: fee,
      EWALL_TOTAL: total,
      EWALL_DATE: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/add-ewallet/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error:", errorData);
        setNotification({ show: true, message: "Failed to submit. Check console for details.", type: "error" });
        setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Success:", data);
      setNotification({ show: true, message: "E-wallet entry submitted successfully!", type: "success" });
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);

      // Reset form
      setEwallApp("");
      setEwallType("");
      setEwallAccName("");
      setEwalNum("");
      setEwallAmount(0);

    } catch (error) {
      console.error("Error submitting:", error);
      setNotification({ show: true, message: "Something went wrong. Check console for details.", type: "error" });
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-6">E-wallet Transaction</h1>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="border-b pb-2 mb-4 border-[#4D1C0A]">
          <h2 className="text-lg font-semibold text-[#4D1C0A] ">E-Wallet Details</h2>
        </div>

        {notification.show && (
        <div className="fixed top-5 right-5 z-50">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* E-Wallet App Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">E-Wallet Type</label>
            <select
              value={ewallApp}
              onChange={(e) => setEwallApp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              required
            >
              <option value="">Select App</option>
              <option value="GCash">GCash</option>
              <option value="Maya">Maya</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Type of Transaction</label>
            <select
              value={ewallType}
              onChange={(e) => setEwallType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              required
            >
              <option value="">Select Type</option>
              <option value="Cash-In">Cash-In</option>
              <option value="Cash-Out">Cash-Out</option>
            </select>
          </div>

          {/* Account Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Account Name</label>
            <input
              type="text"
              value={ewallAccName}
              onChange={(e) => setEwallAccName(e.target.value)}
              placeholder="Enter account name"
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Mobile Number</label>
            <input
              type="text"
              value={ewalNum}
              onChange={(e) => {
                const val = e.target.value;
                // Only allow numbers and max length 11
                if (/^\d*$/.test(val) && val.length <= 11) setEwalNum(val);
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              placeholder="e.g., 09123456789"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Amount</label>
            <input
              type="number"
              value={ewallAmount}
              onChange={(e) =>
                setEwallAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800"
              required
            />
          </div>

          {/* Fee & Total */}
          <div className="md:col-span-2 text-gray-700">
            <p>Fee: Php {fee.toFixed(2)}</p>
            <p className="font-bold">Total: Php {total.toFixed(2)}</p>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className={`bg-[#F8961E] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#f7a136] transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Ewallet;
