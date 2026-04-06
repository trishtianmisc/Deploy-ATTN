import { use, useEffect, useState } from "react";
import { data, useNavigate } from 'react-router-dom';
import { Search } from "lucide-react";


//function modal to view the info of each product 
function ViewProductModal({ isOpen, onClose, product, onEdit }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg relative animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-[#4D1C0A] border-b pb-2">Product Details</h2>

        <div className="space-y-6">

          {/* Product Image */}
          <div className="flex justify-center">
            {product.image ? (
              <img
                src={`http://127.0.0.1:8000${product.image}`}
                className="w-40 h-40 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                No Image
              </div>
            )}
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name", value: product.display_name || product.name },
              { label: "Category", value: product.category?.name || "N/A" },
              { label: "Cost Price", value: `₱ ${product.cost_price}` },
              { label: "Selling Price", value: `₱ ${product.selling_price}` },
              { label: "Stock Status", value: product.stock_status ? "In-stock" : "Out of Stock" },
              { label: "Stock Quantity", value: product.stock },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-sm text-gray-500">{item.label}</span>
                <div className="mt-1 p-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                  <p className="text-md font-medium text-gray-700">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => navigate(`/inventory_edit_product/${product.id}`)}
            className="bg-gradient-to-r from-[#F8961E] to-[#FFB057] text-white px-6 py-2 rounded-xl font-semibold hover:from-[#e78c1c] hover:to-[#f7a541] transition shadow-md"
          >
            Edit
          </button>
        </div>

      </div>
    </div>
  );
}



function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCaategory, setFilterCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error("Error fetching products: ", err));

    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const filteredProducts = products.filter((item) => {
    const categoryName = typeof item.category === 'object' ? (item.category?.name || '') : (item.category || '');
    const itemName = (item.display_name || item.name || '').toString();

    const matchesSearch =
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      categoryName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filterCaategory === "" || categoryName === filterCaategory;

    return matchesSearch && matchesCategory;
  });


  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  }

  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: false }),
      });

      if (!res.ok) throw new Error("Failed to delete product");

      // Show success notification
      setNotification({ show: true, message: "Product deleted successfully!", type: "success" });

      // Remove product from list
      setProducts(products.filter(p => p.id !== id));

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
    } catch (error) {
      console.error("Error deleting product: ", error);
      setNotification({ show: true, message: "Failed to delete product", type: "error" });
      setTimeout(() => setNotification({ show: false, message: "", type: "error" }), 3000);
    }
  };


  return (
    <div className="p-3">
      {/* Toast Notification */}
      {notification.show && (
        <div className="toast toast-top toast-end">
          <div className={`alert ${notification.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">Products</h1>
      <div className="border rounded-xl p-6 shadow-sm bg-white ">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold pb-2 text-[#4D1C0A]">Product List</h2>
          <button
            className="bg-[#F8961E] text-md font-bold text-white px-4 py-2 
          rounded-lg hover:bg-[#f7a136] transition"
            onClick={() => navigate("/inventory_add_product")}>+ Add Product</button>
        </div>
        <div className="border border-b-1 border-[#4D1C0A]"></div>

        {/* search filter */}
        <div className="flex items-center justify-between mb-4 mt-4 w-full overflow-hidden">

          {/* Search Section */}
          <div className="w-full max-w-sm relative">
            <Search className="absolute w-5 h-5 mt-2 ml-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg w-full p-2 pl-10 border-gray-300 text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-[#F8961E]/50
              focus:border-[#F8961E]
              transition-all"
            />
          </div>

          {/* Filter Button */}
          <select
            className="border font-semibold text-[#4D1C0A] border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition ml-4"
            value={filterCaategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

        </div>



        {/* table */}
        <div className="overflow-y-auto max-h-[520px] overflow-y-auto mt-4 rounded-lg bg-white shadow-inner">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="text-left bg-gray-50 text-gray-600 border-b sticky top-0 z-10">
                <th className="text-sm p-3">Products</th>
                <th className="text-sm p-3">Category</th>
                <th className="text-sm p-3">Cost Price</th>
                <th className="text-sm p-3">Selling Price</th>
                <th className="text-sm p-3">Stock Status</th>
                <th className="text-sm p-3 pl-10">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className={`${prod.stock <= 10 ? "bg-red-100 text-red-700" : ""}`}>
                    <td className="p-3 text-gray-700 font-medium">{prod.display_name || prod.name}</td>
                    <td className="p-3 text-gray-500 ">{prod.category?.name || 'N/A'}</td>
                    <td className="p-3 text-gray-500">₱ {prod.cost_price}</td>
                    <td className="p-3 text-gray-500">₱ {prod.selling_price}</td>
                    <td className="p-3 text-gray-500">
                      {prod.stock_status ? "In-stock" : "Out of Stock"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => handleViewProduct(prod)} className="border px-3 py-1 border border-[#4D170A] rounded-lg text-[#4D170A] hover:bg-[#4D170A] hover:text-white transition">View</button>
                      <button
                        onClick={() => {
                          setDeleteId(prod.id);
                          setShowDeleteModal(true);
                        }}
                        className="border px-3 py-1 bg-[#EA6464] rounded-lg text-white hover:bg-[#f57676] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                ))
              )}
            </tbody>
          </table>

          {showModal && selectedProduct && (
            <ViewProductModal
              isOpen={showModal}
              product={selectedProduct}
              onClose={() => setShowModal(false)}
            />
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">

                <h2 className="text-lg font-bold text-[#4D1C0A] mb-3">
                  Confirm Deletion
                </h2>

                <p className="text-gray-700 mb-5">
                  Are you sure you want to delete this product?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      handleDelete(deleteId);
                      setShowDeleteModal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#EA6464]  text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          )}






        </div>
      </div>
    </div>

  )
}

export default ProductList;