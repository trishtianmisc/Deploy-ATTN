import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

function EwalletHistory() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // All / Today / Past 7 Days / Past Month / Specific Date
  const [specificDate, setSpecificDate] = useState(""); // Only used if Specific Date is selected

  // Fetch e-wallet data from Django
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ewallets/")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Error fetching ewallet:", err));
  }, []);

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    if (value !== "Specific Date") setSpecificDate("");
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.EWALL_APP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.EWALL_TYPE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.EWALL_ACC_NAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.EWAL_NUM && t.EWAL_NUM.includes(searchTerm)) ||
      t.EWALL_ID.toString().includes(searchTerm);

    const txDate = new Date(t.EWALL_DATE);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const pastMonth = new Date();
    pastMonth.setMonth(today.getMonth() - 1);

    let matchesFilter = true;
    if (selectedFilter === "Today") matchesFilter = txDate.toDateString() === today.toDateString();
    else if (selectedFilter === "Past 7 Days") matchesFilter = txDate >= sevenDaysAgo && txDate <= today;
    else if (selectedFilter === "Past Month") matchesFilter = txDate >= pastMonth && txDate <= today;
    else if (selectedFilter === "Specific Date" && specificDate)
      matchesFilter = txDate.toISOString().split("T")[0] === specificDate;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">E-wallet Transaction List</h1>

      <div className="border rounded-xl p-6 shadow-sm bg-white">
        {/* Header */}
        <div className="border-b pb-2 border-gray-700 mb-4">
          <h2 className="font-bold text-[#4D1C0A]">Transactions</h2>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center justify-between mb-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 border border-gray-300 rounded-lg py-1.5 px-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#F8961E]/50 focus:border-[#F8961E] transition-all"
            />
          </div>

          {/* Filter dropdown + Date picker together */}
          <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-sm btn-outline border-gray-300 hover:bg-gray-50 normal-case font-normal text-gray-700"
              >
                {selectedFilter}
                <ChevronDown className="w-4 h-4 ml-1" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-white rounded-lg w-44 mt-2 border border-gray-200 text-gray-700"
              >
                <li>
                  <a onClick={() => handleFilterChange("All")}>All</a>
                </li>
                <li>
                  <a onClick={() => handleFilterChange("Today")}>Today</a>
                </li>
                <li>
                  <a onClick={() => handleFilterChange("Past 7 Days")}>Past 7 Days</a>
                </li>
                <li>
                  <a onClick={() => handleFilterChange("Past Month")}>Past Month</a>
                </li>
                <li>
                  <a onClick={() => handleFilterChange("Specific Date")}>Specific Date</a>
                </li>
              </ul>
            </div>

            {/* Date picker */}
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              disabled={selectedFilter !== "Specific Date"}
              className={`border rounded-lg py-1 px-1 text-center text-md relative z-10 transition-all ${selectedFilter === "Specific Date"
                ? "border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F8961E]/50 focus:border-[#F8961E] bg-white cursor-text"
                : "border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="table table-md w-full">
            <thead>
              <tr className="text-left bg-gray-50 border-b text-gray-700">

                <th>E-wallet</th>
                <th>Type</th>
                <th>Customer Name</th>
                <th>Account Number</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Fee</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.EWALL_ID} className="text-gray-800">
                    <td>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full 
      ${t.EWALL_APP === "GCash" ? "bg-blue-100 text-blue-700" : ""}
      ${t.EWALL_APP === "Maya" ? "bg-green-100 text-green-700" : ""}
    `}
                      >
                        {t.EWALL_APP}
                      </span>
                    </td>
                    <td>{t.EWALL_TYPE}</td>
                    <td>{t.EWALL_ACC_NAME}</td>
                    <td>{t.EWAL_NUM}</td>
                    <td>₱{t.EWALL_AMOUNT}</td>
                    <td>{t.EWALL_DATE}</td>
                    <td>₱{t.EWALL_FEE}</td>
                    <td>₱{t.EWALL_TOTAL}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EwalletHistory;
