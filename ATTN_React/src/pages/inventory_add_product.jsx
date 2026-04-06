import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
// import Sidebar from "./components/Sidebar";
// import Topbar from "./components/Topbar";
// import PrivateRoute from "./utility/PrivateRoute";
// import Dashboard from "./pages/dashboard";
// import "./App.css";

import { use } from "react";

// Modal component for managing categories (add / edit / delete)
function AddCategoryModal({ 
  isOpen, 
  onClose, 
  categories = [], 
  onCategoryAdded, 
  onCategoryUpdated, 
  onCategoryDeleted 
}) {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    // Frontend duplicate validation (case-insensitive)
    const exists = categories.some(
      (c) => (c.name || "").trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setError("Category with this name already exists.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/categories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to add category");
      }

      const newCategory = await res.json();
      onCategoryAdded(newCategory);
      setCategoryName("");
      onClose();
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err.message || "Error adding category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-lg font-bold text-[#4D1C0A] mb-4">Manage Categories</h2>

        {/* Add new category */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Category
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full border rounded-lg p-2 border-gray-300 text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-[#F8961E]/50
              focus:border-[#F8961E]
              transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <div className="flex justify-end gap-3 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#F8961E] text-white rounded-lg hover:bg-[#f7a136] disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>

        {/* Existing categories list */}
        <div className="border-t pt-4 mt-2 max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Existing Categories</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories yet.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id || cat.name}
                  className="flex items-center justify-between gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2"
                >
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border rounded-lg px-2 py-1 text-gray-800 mr-2"
                    />
                  ) : (
                    <span className="text-gray-800">{cat.name}</span>
                  )}
                  <div className="flex gap-2">
                    {editingId === cat.id ? (
                      <>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-[#F8961E] text-white rounded"
                          onClick={async () => {
                            const trimmed = editingName.trim();
                            if (!trimmed) return;
                            // Prevent renaming to a duplicate (case-insensitive, excluding self)
                            const exists = categories.some(
                              (c) =>
                                c.id !== cat.id &&
                                (c.name || "").trim().toLowerCase() === trimmed.toLowerCase()
                            );
                            if (exists) {
                              alert("Another category with this name already exists.");
                              return;
                            }
                            try {
                              const res = await fetch(`http://127.0.0.1:8000/api/categories/${cat.id}/`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ name: trimmed }),
                              });
                              if (!res.ok) {
                                throw new Error("Failed to update category");
                              }
                              const updated = await res.json();
                              onCategoryUpdated(updated);
                              setEditingId(null);
                              setEditingName("");
                            } catch (err) {
                              console.error("Error updating category:", err);
                            }
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs border rounded text-gray-500"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs border rounded text-gray-600"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditingName(cat.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                          onClick={async () => {
                            const confirmDelete = window.confirm(
                              `Delete category "${cat.name}"? This will remove it from the list.`
                            );
                            if (!confirmDelete) return;
                            try {
                              const res = await fetch(`http://127.0.0.1:8000/api/categories/${cat.id}/`, {
                                method: "DELETE",
                              });
                              if (!res.ok && res.status !== 204) {
                                throw new Error("Failed to delete category");
                              }
                              onCategoryDeleted(cat.id);
                            } catch (err) {
                              console.error("Error deleting category:", err);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ onFileSelect }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    //basic validation for image file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Only SVG, PNG, JPG, JPEG, GIF image file types are allowed.");
      return;
    }

    onFileSelect(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files[0];
    handleFile(droppedFiles);

  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  return (

    <div className="border rounded-xl p-6 shadow-sm bg-white">
      <h2 className="font-bold mb-2 border-b-1 border-[#4D1C0A]-400 pb-2 text-[#4D1C0A]">Product Image</h2>

      <div className={`border-3 border-gray-300 border-dashed mt-4 p-20 rounded-lg
       flex flex-col items-center justify-center text-center text-gray-400 transition-colors
        ${dragActive ? "border-[#F8961E] bg-orange-50" : "border-gray-300"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}>
        {preview ? (
          <img src={preview} alt="Preview" className="h-40 object-contain mb-2" />
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5.002 5.002 0 0115.9 6H16a5 5 0 010 10h-1m-2 4v-8m0 0l-3 3m3-3l3 3" />
            </svg>

            <p className="font-semibold text-gray-500">Click to upload or drag and drop <br /><span className="text-sm text-gray-400">SVG, PNG, JPG, or GIF (MAX. 800×400px)</span></p>
          </>
        )}

        <input type="file" accept=".jpg, .jpeg, .png, .gif, .svg" onChange={handleChange} className="hidden" id="fileUpload" />
        <label htmlFor="fileUpload" className="mt-3 cursor-pointer px-4 py-2 bg-transparent border border-[#4D1C0A]-400 font-semibold text-[#4D1C0A] rounded-lg hover:bg-[#4D1C0A] hover:text-white ">{preview ? "Change Image" : "Upload File"}</label>

      </div>
    </div>
  );
}


function AddProduct() {
  const [product, setProduct] = useState({
    name: "",
    category: "",
    stock: 1,
    cost_price: "",
    selling_price: "",
    stock_status: true,
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [image, setImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Fetch categories and active products on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/categories/"),
          fetch("http://127.0.0.1:8000/api/products/"),
        ]);

        if (!categoriesRes.ok) {
          throw new Error("Failed to fetch categories");
        }
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        setCategories(categoriesData);
        setActiveProducts(productsData || []);
      } catch (err) {
        console.error("Initial data fetch error:", err);
      }
    };

    fetchInitialData();
  }, []);

  //handles field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  // Handle new category added
  const handleCategoryAdded = (newCategory) => {
    setCategories([...categories, newCategory]);
    setProduct({ ...product, category: newCategory.id || newCategory.name });
  };

  //handles quantity 
  const handleQuantityChange = (delta) => {
    setProduct((prev) => ({
      ...prev,
      stock: Math.max(1, prev.stock + delta),
    }));
  };

  //handles quantity input change
  const handleQuantityInput = (e) => {
    let value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) value = 1;

    setProduct((prev) => ({
      ...prev,
      stock: value,
    }));
  }

  //handles form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Product added:", product);

    // Validate category is selected (coerce to string — category may be numeric when set programmatically)
    const categoryValue = String(product.category ?? "");
    if (!categoryValue || categoryValue.trim() === "") {
      setNotification({
        show: true,
        message: "Please select a category before submitting.",
        type: "error",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
      return;
    }

    const normalizedName = product.name.trim().toLowerCase();
    const duplicateExists = activeProducts.some((existingProduct) => {
      const existingName = (existingProduct.display_name || existingProduct.name || "").trim().toLowerCase();
      return existingName === normalizedName;
    });

    if (duplicateExists) {
      setNotification({
        show: true,
        message: "A product with this name already exists. Disable or delete the existing product before adding another with the same name.",
        type: "error",
      });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
      return;
    }

    const formData = new FormData();

    //append product details to formData
    Object.entries(product).forEach(([key, value]) => {
      // Convert "category" key to "category_id" for the backend
      if (key === 'category') {
        formData.append('category_id', value);
      } else {
        formData.append(key, value);
      }
    });

    //append image
    if (image) {
      formData.append("image", image);
    }


    try {
      const res = await fetch("http://127.0.0.1:8000/api/add-product/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response data: ", errorData);
        throw new Error("Failed to add product");
      }

      const data = await res.json();
      setNotification({ show: true, message: "Product added successfully!", type: "success" });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
      console.log("Response data:", data);

      if (data?.is_active) {
        setActiveProducts((prev) => [...prev, data]);
      }

      //clear fields
      setProduct({
        name: "",
        category: "",
        stock: 1,
        cost_price: "",
        selling_price: "",
        stock_status: true,
        is_active: true,
      });
      setImage(null);


    } catch (err) {
      console.error("Error data: ", err);
      setNotification({ show: true, message: "Error adding product.", type: "error" });
      setTimeout(() =>
        setNotification({ show: false, message: "", type: "success" }), 3000);
    }
  };

  return (
    <div>
      {/* notif */}
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

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onCategoryAdded={handleCategoryAdded}
        onCategoryUpdated={(updatedCategory) => {
          setCategories((prev) =>
            prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
          );
        }}
        onCategoryDeleted={(deletedId) => {
          setCategories((prev) => prev.filter((cat) => cat.id !== deletedId));
          // If the deleted category is currently selected on the form, clear it
          setProduct((prev) =>
            /* eslint-disable eqeqeq */
            prev.category == deletedId ? { ...prev, category: "" } : prev
            /* eslint-enable eqeqeq */
          );
        }}
      />

      {/*first section */}
      <form onSubmit={handleSubmit} >
        <div className="p-3">
          <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">Add Product</h1>

          <div className="border rounded-xl p-6 shadow-sm bg-white">
            <h2 className="font-bold mb-2 border-b-1 border-[#4D1C0A]-400 pb-2 text-[#4D1C0A]">
              Product Description
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input type="text" name="name" placeholder="Enter product name" value={product.name} onChange={handleChange}
                  className="w-full border rounded-lg p-2 mt-1
              border-gray-300 text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-[#F8961E]/50
              focus:border-[#F8961E]
              transition-all" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="flex gap-2 mt-1">
                  <select name="category" value={product.category} onChange={handleChange}
                    className="flex-1 border rounded-lg p-2
              border-gray-300 text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-[#F8961E]/50
              focus:border-[#F8961E]
              transition-all
              cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.id || cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-3 py-2 bg-[#F8961E] text-white rounded-lg hover:bg-[#f7a136] transition font-semibold"
                    title="Add new category"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <div className="flex items-center border 
            rounded-lg mt-1 border-gray-300 p-1">
                  <button type="button" onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 border border-t-0 border-l-0 border-b-0 text-gray-300">-</button>
                  <input type="text" name="stock" value={product.stock} onChange={handleQuantityInput}
                    className="w-full text-center border-none  text-gray-400" />
                  <button type="button" onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 border border-t-0 border-r-0 border-b-0 text-gray-300">+</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability Status</label>
                <select name="stock_status" value={product.status} onChange={handleChange}
                  className="w-full border border-gray-300 
            rounded-lg p-2 mt-1 text-gray-700
            focus:outline-none
            focus:ring-2 focus:ring-[#F8961E]/50
            focus:border-[#F8961E]
            transition-all
            cursor-pointer">

                  <option value="">Select Status</option>
                  <option value={true}>In stock</option>
                  <option value={false}>Out of stock</option>
                </select>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input type="text" name="cost_price" value={product.cost_price} onChange={handleChange} placeholder="0.00"
                    className="w-full border border-gray-300 
                  rounded-lg p-2 pl-6 mt-1 text-gray-800
                  bg-white
                  focus:outline-none
                  focus:ring-2 focus:ring-[#F8961E]/50
                  focus:border-[#F8961E]
                  transition-all
                  appearance-none
                  cursor-pointer" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                <input type="text" name="selling_price" value={product.selling_price} onChange={handleChange} placeholder="0.00"
                  className="w-full border border-gray-300 
                  rounded-lg p-2 pl-6 mt-1 text-gray-800
                  bg-white
                  focus:outline-none
                  focus:ring-2 focus:ring-[#F8961E]/50
                  focus:border-[#F8961E]
                  transition-all
                  appearance-none
                  cursor-pointer" required />
                </div>
              </div>
            </div>
          </div>


        </div>

        <div className="p-3">
          <ImageUpload
            key={image ? "has-image" : "no-image"}
            onFileSelect={(file) => setImage(file)}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="mt-6 bg-[#F8961E] font-bold text-white px-6 py-2 rounded-lg hover:bg-[#f7a136]">Publish Product</button>
        </div>
      </form>


    </div>


  );


}



export default AddProduct;