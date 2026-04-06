import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, Clock } from "lucide-react";

import API_URL from "../utility/API_Url";

// -----------------------------
// WEEKLY PREDICTION LOGIC
// -----------------------------
function predictNextWeek(weeklySales) {
  if (!weeklySales || weeklySales.length === 0) return 0;
  
  if (weeklySales.length === 1) return weeklySales[0].total;
  
  if (weeklySales.length <= 3) {
    const avg = weeklySales.reduce((sum, w) => sum + w.total, 0) / weeklySales.length;
    return Math.round(avg);
  }
  
  const x = weeklySales.map((_, i) => i + 1);
  const y = weeklySales.map(w => w.total);
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return Math.round(sumY / n);
  }
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  const prediction = slope * (n + 1) + intercept;
  
  const average = sumY / n;
  const maxRealistic = average * 2;
  
  return Math.round(Math.max(0, Math.min(prediction, maxRealistic)));
}

function getWeekKey(date) {
  const d = new Date(date);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Calculate days until stockout
function calculateDaysUntilStockout(currentStock, predictedWeeklyDemand) {
  if (predictedWeeklyDemand === 0) return null;
  const dailyDemand = predictedWeeklyDemand / 7;
  const daysLeft = Math.floor(currentStock / dailyDemand);
  return daysLeft;
}

// -----------------------------
// MARKET BASKET ANALYSIS
// -----------------------------
function analyzeMarketBasket(orderedItems, orders) {
  // Group items by order_id
  const orderGroups = {};
  
  orderedItems.forEach((item) => {
    const orderId = item.order;
    if (!orderId) return;
    
    if (!orderGroups[orderId]) {
      orderGroups[orderId] = [];
    }
    
    const productName = (item.product_name || "").toLowerCase().trim();
    if (productName) {
      orderGroups[orderId].push(productName);
    }
  });

  // Find all product pairs in each order
  const productPairs = {};
  const productCounts = {};

  Object.values(orderGroups).forEach((products) => {
    // Count individual products
    products.forEach((product) => {
      productCounts[product] = (productCounts[product] || 0) + 1;
    });

    // Find pairs (only unique products in same order)
    const uniqueProducts = [...new Set(products)];
    for (let i = 0; i < uniqueProducts.length; i++) {
      for (let j = i + 1; j < uniqueProducts.length; j++) {
        const pair = [uniqueProducts[i], uniqueProducts[j]].sort().join(" + ");
        productPairs[pair] = (productPairs[pair] || 0) + 1;
      }
    }
  });

  const totalOrders = Object.keys(orderGroups).length;

  // Calculate metrics for each pair
const associations = Object.entries(productPairs).map(([pair, count]) => {
  const [product1, product2] = pair.split(" + ");
  
  const support = (count / totalOrders) * 100;

  // ✅ New confidence calculation: denominator = baskets with product1 OR product2
  const denom = productCounts[product1] + productCounts[product2] - count;
  const confidence = denom > 0 ? (count / denom) * 100 : 0;

  const expectedTogether = (productCounts[product1] / totalOrders) * (productCounts[product2] / totalOrders);
  const lift = (count / totalOrders) / expectedTogether;

  return {
    product1: product1.charAt(0).toUpperCase() + product1.slice(1),
    product2: product2.charAt(0).toUpperCase() + product2.slice(1),
    frequency: count,
    support,
    confidence,   // ✅ single confidence value for the pair
    lift
  };
});

  // Sort by frequency and filter meaningful associations
  associations.sort((a, b) => b.frequency - a.frequency);
  
  // Filter: at least 2 occurrences and lift > 1 (better than random)
  return associations.filter(a => a.frequency >= 2 && a.lift > 1).slice(0, 10);
}

function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [restockData, setRestockData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataInfo, setDataInfo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [basketAnalysis, setBasketAnalysis] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ordered items directly (like dashboard does)
        const itemsRes = await fetch(`${API_URL}/api/ordereditem/`);
        if (!itemsRes.ok) throw new Error(`Failed to fetch ordered items: ${itemsRes.status}`);
        const orderedItems = await itemsRes.json();

        // Fetch orders to get order dates
        const ordersRes = await fetch(`${API_URL}/api/orders/`);
        if (!ordersRes.ok) throw new Error(`Failed to fetch orders: ${ordersRes.status}`);
        const orders = await ordersRes.json();

        const productsRes = await fetch(`${API_URL}/api/products/`);
        if (!productsRes.ok) throw new Error(`Failed to fetch products: ${productsRes.status}`);
        const productsData = await productsRes.json();

        console.log("Fetched ordered items:", orderedItems);
        console.log("Fetched orders:", orders);
        console.log("Fetched products:", productsData);
        
        setProducts(productsData);
        processSalesData(orderedItems, orders, productsData);
        
        // Analyze market basket
        const basketResults = analyzeMarketBasket(orderedItems, orders);
        setBasketAnalysis(basketResults);
        console.log("Market Basket Analysis:", basketResults);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    console.log('Analytics mounted — fetching data');
    fetchData();
    return () => console.log('Analytics unmounted');
  }, []);

  const processSalesData = (orderedItems, orders, productsData) => {
    if (!orderedItems || orderedItems.length === 0) {
      setDataInfo("No orders found in database");
      setSalesData([]);
      setRestockData([]);
      return;
    }

    // Create a map of order_id to order_date for quick lookup
    const orderDateMap = {};
    orders.forEach((order) => {
      orderDateMap[order.order_id] = order.order_date;
    });

    const productWeeks = {};
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    let earliestDate = null;
    let latestDate = null;
    let totalWeeks = new Set();
    let processedItems = 0;

    orderedItems.forEach((item) => {
      processedItems++;
      
      // Get order date from the orderDateMap or from item.order_date (if available)
      const orderDateStr = item.order_date || orderDateMap[item.order];
      if (!orderDateStr) {
        console.warn(`Item missing order date:`, item);
        return;
      }
      
      const orderDate = new Date(orderDateStr);
      const weekNum = getWeekKey(orderDate);
      totalWeeks.add(weekNum);
      
      if (!earliestDate || orderDate < earliestDate) earliestDate = orderDate;
      if (!latestDate || orderDate > latestDate) latestDate = orderDate;

      const name = (item.product_name || "").toLowerCase().trim();
      if (!name) {
        console.warn(`Item missing product_name:`, item);
        return;
      }
      
      const qty = parseInt(item.qty) || 0;

      if (!productWeeks[name]) {
        productWeeks[name] = {
          weeks: {},
          currentWeekSales: 0
        };
      }

      if (!productWeeks[name].weeks[weekNum]) {
        productWeeks[name].weeks[weekNum] = 0;
      }
      productWeeks[name].weeks[weekNum] += qty;

      if (orderDate >= oneWeekAgo && orderDate <= now) {
        productWeeks[name].currentWeekSales += qty;
      }
    });

    console.log(`Processed ${processedItems} items from ${orders.length} orders`);

    if (earliestDate && latestDate) {
      setDataInfo(
        `Analyzing ${processedItems} items across ${totalWeeks.size} week${totalWeeks.size !== 1 ? 's' : ''} (${earliestDate.toLocaleDateString()} to ${latestDate.toLocaleDateString()})`
      );
    }

    const chartData = Object.entries(productWeeks).map(([product, data]) => {
      const weeklySales = Object.entries(data.weeks)
        .map(([week, total]) => ({ week, total }))
        .sort((a, b) => a.week.localeCompare(b.week));

      return {
        product,
        thisWeek: data.currentWeekSales,
        nextWeek: predictNextWeek(weeklySales),
        weeksOfData: weeklySales.length
      };
    });

    chartData.sort((a, b) => b.thisWeek - a.thisWeek);
    const top = chartData.slice(0, 5).map((d) => ({
      ...d,
      thisWeek: Number(d.thisWeek) || 0,
      nextWeek: Number(d.nextWeek) || 0,
    }));
    console.log('Processed chartData (top):', top);
    setSalesData(top);

    const restockRecommendations = productsData.map((product) => {
      const productName = (product.display_name || product.name).toLowerCase().trim();
      const prediction = productWeeks[productName] 
        ? predictNextWeek(
            Object.entries(productWeeks[productName].weeks)
              .map(([week, total]) => ({ week, total }))
              .sort((a, b) => a.week.localeCompare(b.week))
          )
        : 0;

      const safetyBuffer = Math.ceil(prediction * 0.2);
      const suggestedRestock = Math.max(0, prediction + safetyBuffer - product.stock);
      
      const daysUntilStockout = calculateDaysUntilStockout(product.stock, prediction);
      
      let notificationMessage = null;
      if (daysUntilStockout !== null && daysUntilStockout <= 5 && daysUntilStockout > 0) {
        notificationMessage = `${product.display_name || product.name} will likely be out of stock in ${daysUntilStockout} day${daysUntilStockout !== 1 ? 's' : ''}. Restock soon!`;
      } else if (product.stock === 0) {
        notificationMessage = `${product.display_name || product.name} is OUT OF STOCK! Restock immediately!`;
      }

      return {
        id: product.id,
        productName: product.display_name || product.name,
        currentStock: product.stock,
        predictedDemand: prediction,
        suggestedRestock: suggestedRestock,
        daysUntilStockout: daysUntilStockout,
        notificationMessage: notificationMessage,
        stockStatus: product.stock_status
      };
    });

    restockRecommendations.sort((a, b) => {
      if (a.currentStock === 0 && b.currentStock !== 0) return -1;
      if (a.currentStock !== 0 && b.currentStock === 0) return 1;
      if (a.daysUntilStockout !== null && b.daysUntilStockout !== null) {
        return a.daysUntilStockout - b.daysUntilStockout;
      }
      return a.currentStock - b.currentStock;
    });
    
    setRestockData(restockRecommendations);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Make sure your Django server is running on http://127.0.0.1:8000
          </p>
        </div>
      </div>
    );
  }

  if (salesData.length === 0 && restockData.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sales Analytics & Prediction</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800">
            No sales data available yet. Create some orders to see analytics and predictions!
          </p>
        </div>
      </div>
    );
  }

  const urgentNotifications = restockData.filter(item => item.notificationMessage);

  // Filter restockData based on search query
  const filteredRestockData = restockData.filter(item =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 text-[#4D1C0A]">Sales Analytics & Prediction</h1>
      {dataInfo && (
        <p className="text-sm text-gray-600 mb-4">{dataInfo}</p>
      )}

      {urgentNotifications.length > 0 && (
        <div className="bg-white border-l-4 border-[#F8961E] p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-start text-gray-700">
            <AlertTriangle className="h-6 w-6 text-[#F8961E] mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-[#4D1C0A] font-bold mb-3 text-lg">Urgent Stock Alerts</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {urgentNotifications.map((item) => (
                  <div key={item.id} className="flex items-start bg-gray-50 rounded-md p-2 border border-[#F8961E]/20">
                    <Clock className="h-4 w-4 mr-2 text-[#F8961E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#4D1C0A] font-medium">{item.notificationMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#4D1C0A]">
          Top Products: This Week vs Next Week
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={salesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="product" 
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-[#F8961E] rounded shadow-lg">
                      <p className="font-semibold capitalize mb-2 text-[#4D1C0A]">{data.product}</p>
                      <p className="text-[#F8961E]">This Week: <strong>{data.thisWeek}</strong> units</p>
                      <p className="text-[#4D1C0A]">Predicted: <strong>{data.nextWeek}</strong> units</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Based on {data.weeksOfData} week{data.weeksOfData !== 1 ? 's' : ''} of history
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="thisWeek" fill="#F8961E" name="This Week" />
            <Bar dataKey="nextWeek" fill="#4D1C0A" name="Predicted Next Week" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#4D1C0A]">
              AI-Powered Restock Recommendations
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              Based on sales patterns & predictive analytics
            </div>
          </div>

          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 border border-[#F8961E]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F8961E] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-[#F8961E] mb-4"></div>

        {/* Scrollable Table Body */}
        <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-t border-gray-400 text-left text-gray-500">
                <th className="p-3">Product Name</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Days Until Stockout</th>
                <th className="p-3">Suggested Restock</th>
              </tr>
            </thead>

            <tbody>
              {filteredRestockData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-400">
                    {searchQuery
                      ? `No products found matching "${searchQuery}"`
                      : "No products found."}
                  </td>
                </tr>
              ) : (
                filteredRestockData.map((item) => {
                  const isLowStock = item.currentStock <= 10;
                  const isOutOfStock = item.currentStock === 0;
                  const isUrgent =
                    item.daysUntilStockout !== null && item.daysUntilStockout <= 3;

                  return (
                    <tr
                      key={item.id}
                      className={`${
                        isOutOfStock
                          ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                          : isUrgent
                          ? "bg-orange-50 text-orange-700 border-l-4 border-[#F8961E]"
                          : isLowStock
                          ? "bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500"
                          : ""
                      }`}
                    >
                      <td className="p-3 font-medium text-gray-700">
                        {item.productName}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-red-600"
                              : isLowStock
                              ? "text-yellow-600"
                              : "text-gray-700"
                          }`}
                        >
                          {item.currentStock}
                        </span>
                        {isOutOfStock && (
                          <span className="ml-2 text-xs bg-red-200 px-2 py-1 rounded">
                            OUT OF STOCK
                          </span>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <span className="ml-2 text-xs bg-yellow-200 px-2 py-1 rounded">
                            LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isOutOfStock ? (
                          <span className="text-red-600 font-semibold flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Out of Stock
                          </span>
                        ) : item.daysUntilStockout !== null ? (
                          <span
                            className={`font-semibold flex items-center ${
                              item.daysUntilStockout <= 3
                                ? "text-orange-600"
                                : "text-gray-600"
                            }`}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            {item.daysUntilStockout} day
                            {item.daysUntilStockout !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#F8961E]">
                          {item.suggestedRestock > 0 ? item.suggestedRestock : "—"}
                        </span>
                        {item.suggestedRestock > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Predicted: {item.predictedDemand} + 20% buffer)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Basket Analysis Section */}
      <div className="bg-white border border-[#F8961E]/30 rounded-lg p-6 shadow-sm mt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#4D1C0A]">
            Market Basket Analysis
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            Products frequently bought together
          </div>
        </div>

        <div className="border-b border-[#F8961E] mb-4"></div>

        {basketAnalysis.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Not enough data for market basket analysis.</p>
            <p className="text-sm mt-2">Need at least 2 orders with multiple items to identify patterns.</p>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-t border-gray-400 text-left text-gray-500">
                  <th className="p-3">Product Combination</th>
                  <th className="p-3">Bought Together</th>
                  <th className="p-3">Support %</th>
                  <th className="p-3">Confidence %</th>
                  <th className="p-3">Lift</th>
                </tr>
              </thead>

<tbody>
                {basketAnalysis.map((item, index) => {
                  const isStrong = item.lift >= 2;
                  const isModerate = item.lift >= 1.5 && item.lift < 2;

                  return (
                    <tr
                      key={index}
                      className={`${
                        isStrong
                          ? "bg-green-50 border-l-4 border-green-500"
                          : isModerate
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >

                      <td className="p-3">
                        <div className="font-medium text-gray-700">
                          <span className="text-gray-800">{item.product1}</span>
                          <span className="text-gray-400 mx-2">+</span>
                          <span className="text-gray-800">{item.product2}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-gray-700">
                          {item.frequency} times
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-600">
                          {item.support.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-600">
                          {item.confidence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            isStrong
                              ? "text-green-600"
                              : isModerate
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.lift.toFixed(2)}x
                        </span>
                        {isStrong && (
                          <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                            STRONG
                          </span>
                        )}
                        {isModerate && (
                          <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">
                            MODERATE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {basketAnalysis.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>How to read this:</strong> Support = % of orders with both items | 
              Confidence = Likelihood of buying together | 
              Lift &gt; 1 = Products are bought together more than random chance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;