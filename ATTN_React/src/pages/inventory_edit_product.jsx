import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { use } from "react";


export default function EditProduct() {
  console.log("Params:", useParams());
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    category: "",
    cost_price: "",
    selling_price: "",
    stock: 1,
    stock_status: false,
    image: null,
    is_active: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product data");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        //data keys should match serializer input
        setProduct((prev) => ({
          ...prev,
          name: data.name ?? "",
          category: data.category?.id ?? "",
          cost_price: data.cost_price ?? "",
          selling_price: data.selling_price ?? "",
          stock: data.stock ?? 1,
          stock_status: data.stock_status ?? true,
          image: data.image ?? null,
          is_active: data.is_active ?? true,
        }));

        if (data.image) {
          setPreview(`http://127.0.0.1:8000${data.image}`);
        } else {
          setPreview(PLACEHOLDER_IMAGE_PATH);
        }
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        // setError({ fetch: "Unable to load product. " });
      })
      .finally(() => setLoading(false));

    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    return () => {
      mounted = false;
    };
  }, [id]);

  //when new image file is selected, update preview
  const handleImageChange = (file) => {
    if (!file) return;
    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  //input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    //special handling for stock_status: convert string to boolean
    if (name === "stock_status") {
      const boolVal = value === "true" || value === true;
      setProduct((p) => ({ ...p, stock_status: boolVal }));
      return;
    }

    //numeric conversion for stock
    if (name === "stock") {
      const num = parseInt(value || "0", 10);
      const newStock = Number.isNaN(num) ? 0 : num;
      setProduct((p) => ({ ...p, stock: newStock, stock_status: newStock > 0 ? true : p.stock_status }));
      return;
    }

    setProduct((p) => ({ ...p, [name]: value }));
  };

  const changeStock = (amount) => {
    setProduct((p) => {
      const newStock = Math.max(0, (p.stock || 0) + amount);
      return {
        ...p,
        stock: newStock,
        stock_status: newStock > 0 ? true : p.stock_status,
      };
    });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handleImageChange(file);
  };

  //submit edited product data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      //append product fields to formdata
      formData.append("name", product.name);
      formData.append("category_id", product.category);
      formData.append("cost_price", product.cost_price);
      formData.append("selling_price", product.selling_price);
      formData.append("stock_status", product.stock_status);
      formData.append("stock", product.stock);
      formData.append("description", product.description || "");

      //append file if user selected new image
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
        method: "PATCH", //patch is for partial update
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Save error response:", errorData);
        setError(errorData || { save: "Failed to save product" });
        throw new Error("Save failed");
      }

      const updatedData = await res.json();
      //show success notification
      setNotification({ show: true, message: "Product edited successfully!", type: "success" });
      
      //auto-hide after 3 seconds and navigate back
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
        navigate("/inventory_product_list");
      }, 3000);
    } catch (err) {
      console.error("Error updating product:", err);
      if (!error) setError({ save: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }

  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <>
    {/* Toast Notification */}
      {notification.show && (
        <div className="toast toast-top toast-end z-[9999]">
          <div className={`alert ${notification.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    <div className="p-3">
      <h1 className="text-2xl font-bold text-[#4D1C0A] mb-4">Edit Product</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600">
          {Object.entries(error).map(([k, v]) => (
            <div key={k}>{Array.isArray(v) ? v.join(", ") : v}</div>
          ))}
        </div>
      )}

      <div className="border rounded-xl p-6 shadow-sm bg-white">
        <h2 className="font-bold mb-2 border-b-1 border-[#4D1C0A]-400 pb-2 text-[#4D1C0A]">
          Product Description
        </h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input type="text" name="name" value={product.name} onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1
              border-gray-300 text-gray-800
              focus:outline-none
              focus:ring-2 focus:ring-[#F8961E]/50
              focus:border-[#F8961E]
              transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" value={product.category} onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 
            border-gray-300 text-gray-800
            focus:outline-none
            focus:ring-2 focus:ring-[#F8961E]/50
            focus:border-[#F8961E]
            transition-all
            cursor-pointer">
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <div className="flex items-center border 
            rounded-lg mt-1 border-gray-300 p-1">
              <button type="button" onClick={() => changeStock(-1)}
                className="px-3 py-1 border border-t-0 border-l-0 border-b-0 text-gray-300">-</button>
              <input type="text" name="stock" value={product.stock} onChange={handleChange}
                className="w-full text-center border-none text-gray-400" />
              <button type="button" onClick={() => changeStock(1)}
                className="px-3 py-1 border border-t-0 border-r-0 border-b-0 text-gray-300">+</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Availability Status</label>
            <select name="stock_status" value={product.stock_status} onChange={handleChange}
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
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <input type="text" name="cost_price" value={product.cost_price} onChange={handleChange} placeholder="₱ 0.00"
                className="w-full border border-gray-300 pl-6
            rounded-lg p-2 mt-1 text-gray-800
            bg-white
            focus:outline-none
            focus:ring-2 focus:ring-[#F8961E]/50
            focus:border-[#F8961E]
            transition-all
            appearance-none
            cursor-pointer" />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
            
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <input type="text" name="selling_price" value={product.selling_price} onChange={handleChange} placeholder="₱ 0.00"
                className="w-full border border-gray-300 pl-6
            rounded-lg p-2 mt-1 text-gray-800
            bg-white
            focus:outline-none
            focus:ring-2 focus:ring-[#F8961E]/50
            focus:border-[#F8961E]
            transition-all
            appearance-none
            cursor-pointer" />
            </div>

          </div>

        </div>
      </div>

      {/* product image and upload section */}
      <div className="border rounded-xl p-6 shadow-sm bg-white mt-6">
        <h2 className="font-bold mb-2 border-b-1 border-[#4D1C0A]-400 pb-2 text-[#4D1C0A]">Product Image</h2>
        <div className="border border-dashed rounded-lg p-4 flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-md mb-3"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}

          <input
            id="edit-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <label
              htmlFor="edit-image-input"
              className="px-4 py-2 bg-white border text-sm rounded-md cursor-pointer text-[#4D1C0A] hover:bg-[#4D1C0A] hover:text-white"
            >
              Choose Image
            </label>

            <button
              type="button"
              onClick={() => {
                setImage(null);
                // reset preview to backend image or placeholder
                if (product.image) {
                  setPreview(`http://127.0.0.1:8000${product.image}`);
                } else {
                  setPreview(PLACEHOLDER_IMAGE_PATH);
                }
              }}
              className="px-4 py-2 border rounded-md text-sm text-gray-500 hover:bg-gray-300"
            >
              Reset Image
            </button>
          </div>
        </div>
      </div>




      {/* chat */}

      <form onSubmit={handleSubmit}>
        <div>

          {/* RIGHT: Fields */}
          <div>


            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border rounded-md text-sm text-gray-500 mt-4 hover:bg-gray-300"
                onClick={() => navigate("/inventory_product_list")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#F8961E] text-white font-semibold mt-4 hover:bg-[#f7a136]"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    </>
  )

}
