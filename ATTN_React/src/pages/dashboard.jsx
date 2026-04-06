import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import API_URL from "../utility/API_Url";

export default function Dashboard() {
  const [todaySalesCount, setTodaySalesCount] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [topProduct, setTopProduct] = useState("Loading...");
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalMonthSales, setTotalMonthSales] = useState(0);
  const [totalMonthProfit, setTotalMonthProfit] = useState(0);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState([]);
  const [totalYearSales, setTotalYearSales] = useState(0);
  const [totalYearProfit, setTotalYearProfit] = useState(0);

  const yearOptions = [];
  for (let y = 2020; y <= new Date().getFullYear(); y++) {
    yearOptions.push(y);
  }

  // 🔥 Helper function to process all fetched data
  const processDashboardData = (data) => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();
    const todayDate = today.getDate();

    // ---- Today’s Items ----
    const todaysItems = data.filter((item) => {
      if (!item.order_date) return false;
      const d = new Date(item.order_date);
      return (
        d.getDate() === todayDate &&
        d.getMonth() + 1 === todayMonth &&
        d.getFullYear() === todayYear
      );
    });

    // ---- Today's Sales ----
    const totalSales = todaysItems.reduce((sum, item) => {
      return sum + parseFloat(item.selling_price || 0) * (item.qty || 0);
    }, 0);

    // ---- Today's Profit ----
    const totalProfit = todaysItems.reduce((sum, item) => {
      return (
        sum +
        (parseFloat(item.selling_price || 0) -
          parseFloat(item.cost_price || 0)) *
          (item.qty || 0)
      );
    }, 0);

    setTodaySalesCount(totalSales);
    setTodayProfit(totalProfit);

    // ---- Top Product ----
     // ---- Today's Top-Selling Product ----
    const todayProductTotals = {};
    todaysItems.forEach((item) => {
      const name = item.product_name;
      todayProductTotals[name] = (todayProductTotals[name] || 0) + (item.qty || 0);
    });

    const sortedTodayProducts = Object.entries(todayProductTotals).sort(
      (a, b) => b[1] - a[1]
    );

    setTopProduct(
      sortedTodayProducts.length ? sortedTodayProducts[0][0] : "No sales today"
    );


    updateWeeklyData(selectedMonth, data);
    updateYearlyData(selectedYear, data);
  };

  // ---- Weekly aggregation ----
  const updateWeeklyData = (month, data) => {
    const monthOrders = data.filter((item) => {
      if (!item.order_date) return false;
      const d = new Date(item.order_date);
      return d.getMonth() + 1 === parseInt(month);
    });

    const weeks = [];
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    const numWeeks = Math.ceil(daysInMonth / 7);

    for (let i = 0; i < numWeeks; i++) weeks.push([]);

    monthOrders.forEach((item) => {
      const orderDate = new Date(item.order_date);
      const weekNumber = Math.floor((orderDate.getDate() - 1) / 7);
      weeks[weekNumber].push(item);
    });

    const weeklyTotals = weeks.map((weekItems, i) => {
      const sales = weekItems.reduce(
        (sum, item) =>
          sum + parseFloat(item.selling_price || 0) * (item.qty || 0),
        0
      );
      const profit = weekItems.reduce(
        (sum, item) =>
          sum +
          (parseFloat(item.selling_price || 0) -
            parseFloat(item.cost_price || 0)) *
            (item.qty || 0),
        0
      );
      return { week: `Week ${i + 1}`, sales, profit };
    });

    setWeeklyData(weeklyTotals);
    setTotalMonthSales(weeklyTotals.reduce((s, w) => s + w.sales, 0));
    setTotalMonthProfit(weeklyTotals.reduce((s, w) => s + w.profit, 0));
  };

  // ---- Yearly aggregation ----
  const updateYearlyData = (year, data) => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "short" }),
      sales: 0,
      profit: 0,
    }));

    data.forEach((item) => {
      if (!item.order_date) return;
      const d = new Date(item.order_date);
      if (d.getFullYear() !== Number(year)) return;

      const monthIndex = d.getMonth();
      months[monthIndex].sales +=
        parseFloat(item.selling_price || 0) * (item.qty || 0);
      months[monthIndex].profit +=
        (parseFloat(item.selling_price || 0) -
          parseFloat(item.cost_price || 0)) *
        (item.qty || 0);
    });

    setYearlyData(months);
    setTotalYearSales(months.reduce((s, m) => s + m.sales, 0));
    setTotalYearProfit(months.reduce((s, m) => s + m.profit, 0));
  };

  // 🚀 INITIAL FETCH (RUN ONCE)
  useEffect(() => {
    fetch(`${API_URL}/api/ordereditem/`)
      .then((res) => res.json())
      .then(processDashboardData);

    fetch(`${API_URL}/api/analytics/`)
      .then((res) => res.json())
      .then((data) => {
        setDailySales(data.daily_sales || []);
        setTopProducts(data.top_products || []);
      });
  }, []);

  // 🚀 AUTO UPDATE EVERY 3 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/ordereditem/`)
        .then((res) => res.json())
        .then(processDashboardData);

      fetch(`${API_URL}/api/analytics/`)
        .then((res) => res.json())
        .then((data) => {
          setDailySales(data.daily_sales || []);
          setTopProducts(data.top_products || []);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear]);

  // -------------------------------- UI --------------------------------
  return (
    <>
      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border-l-4 border-[#F8961E] p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-500">Today's Top-Selling Product</p>
          <h2 className="text-xl font-bold text-[#F8961E] mt-1">{topProduct}</h2>
        </div>

        <div className="bg-white border-l-4 border-[#F8961E] p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-500">Today's Sales</p>
          <h2 className="text-xl font-bold text-[#F8961E] mt-1">
            ₱{todaySalesCount.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white border-l-4 border-[#F8961E] p-4 rounded-md shadow-sm">
          <p className="text-sm text-gray-500">Today's Profit</p>
          <h2 className="text-xl font-bold text-[#F8961E] mt-1">
            ₱{todayProfit.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ===== DAILY SALES ===== */}
      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Daily Sales (Past 7 Days)
        </h2>
        <div className="w-full h-72 text-gray-700">
          <ResponsiveContainer>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="order_date"  fill="gray"/>
              <YAxis tickFormatter={(v) => `₱${v}`} />
              <Tooltip
                formatter={(v) => `₱${v.toLocaleString()}`}
                labelFormatter={(l) => `${l}`}
              />
              
              <Line type="monotone" dataKey="total" name="Total" stroke="#F8961E" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== TOP PRODUCTS ===== */}
      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Top 5 Best-Selling Products
        </h2>
        <div className="w-full h-72 text-gray-700">
          <ResponsiveContainer>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" fill="gray"/>
              <YAxis />
              <Tooltip 
                formatter={(value, name) =>
                  name === "total_qty" ? [value, "Total Quantity"] : [value, name]
                }/>
              <Bar dataKey="total_qty" fill="#F8961E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== MONTHLY STATS ===== */}
      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Monthly Sales & Profit by Week
        </h2>

        <select
          className="border border-gray-300 rounded p-2 text-gray-700 mb-4"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <div className="mb-4 font-bold text-gray-700">
          Total Sales: ₱{totalMonthSales.toLocaleString()} | Total Profit: ₱
          {totalMonthProfit.toLocaleString()}
        </div>

        <div className="w-full h-72 text-gray-700">
          <ResponsiveContainer>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(v) => `₱${v}`} />
              <Tooltip 
              formatter={(v) => `₱${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="sales" fill="#F8961E" name="Sales" />
              <Bar dataKey="profit" fill="#4D1C0A" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== YEARLY STATS ===== */}
      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Yearly Sales & Profit by Month
        </h2>

        <select
          className="border border-gray-300 rounded p-2 text-gray-700 mb-4"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <div className="mb-4 font-bold text-gray-700">
          Total Sales: ₱{totalYearSales.toLocaleString()} | Total Profit: ₱
          {totalYearProfit.toLocaleString()}
        </div>

        <div className="w-full h-72 text-gray-700">
          <ResponsiveContainer>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="sales" fill="#F8961E" name="Sales" />
              <Bar dataKey="profit" fill="#4D1C0A" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
