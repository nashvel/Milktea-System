import { Link } from "react-router-dom";
import SideMenu from "../../../layouts/sidemenuAdmin";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPen } from "react-icons/fa";
import ReactDOM from "react-dom";

function InventoryList() {
  // Product states
  const [products, setProducts] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [editNameId, setEditNameId] = useState<number | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");
  const [editPriceId, setEditPriceId] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>("");
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const penRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // We'll add ingredients management in a separate page

  useEffect(() => {
    // Fetch products
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        // If your API returns { products: [...] }
        if (data.products) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const updateStock = (id: number, delta: number) => {
    // Find the product to get the current stock
    const product = products.find((p) => p.product_id === id);
    if (!product) return;
    const newStock = Math.max(0, (Number(product.stock) || 0) + delta);

    // Send PATCH request to backend
    fetch(`http://localhost:8080/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update stock');
        return res.json();
      })
      .then(() => {
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === id ? { ...p, stock: newStock } : p
          )
        );
        // Handle localStorage for low stock
        const updatedProducts = products.map((p) =>
          p.product_id === id ? { ...p, stock: newStock } : p
        );
        updatedProducts.forEach((product) => {
          if (product.stock < 20) {
            let lowStock = JSON.parse(localStorage.getItem('lowStockItems') || '[]');
            if (!lowStock.includes(product.name)) {
              lowStock.push(product.name);
              localStorage.setItem('lowStockItems', JSON.stringify(lowStock));
            }
          } else {
            let lowStock = JSON.parse(localStorage.getItem('lowStockItems') || '[]');
            if (lowStock.includes(product.name)) {
              lowStock = lowStock.filter((item: string) => item !== product.name);
              localStorage.setItem('lowStockItems', JSON.stringify(lowStock));
            }
          }
        });
        toast.success('Stock updated!', { position: 'top-center' });
      })
      .catch((error) => {
        alert('Failed to update stock.');
        console.error(error);
      });
  };

  // Delete product handler
  const deleteProduct = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    fetch(`http://localhost:8080/api/products/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete product');
        setProducts((prev) => prev.filter((p) => p.product_id !== id));
        toast.success('Product deleted!', { position: 'top-center' });
      })
      .catch((error) => {
        toast.error('Failed to delete product.', { position: 'top-center' });
        console.error(error);
      });
  };

  // Category filter bar logic
  const filterCategories = [
    { label: 'All', value: 'All' },
    { label: 'MILKTEA', value: 'milktea' },
    { label: 'SMOOTHIE', value: 'smoothie' },
    { label: 'ICED TEA', value: 'iced tea' },
  ];
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  // Add a default image path
  const defaultImage = '/src/assets/default-avatar.png';
  // Helper to get the correct image URL
  const getImageUrl = (img: string | undefined) => {
    if (!img) return defaultImage;
    // If already a full URL
    if (img.startsWith('http')) return img;
    // If just a filename, prepend backend public path
    return `http://localhost:8080/images/product/${img}`;
  };

  const openDeleteModal = (id: number) => setDeleteModal({ open: true, id });
  const closeDeleteModal = () => setDeleteModal({ open: false, id: null });
  const confirmDelete = () => {
    if (deleteModal.id == null) return;
    deleteProduct(deleteModal.id);
    closeDeleteModal();
  };

  // Edit name handler
  const startEditName = (id: number, currentName: string) => {
    setEditNameId(id);
    setEditNameValue(currentName);
    setDropdownOpen(null);
  };
  const cancelEditName = () => {
    setEditNameId(null);
    setEditNameValue("");
  };
  const saveEditName = (id: number) => {
    fetch(`http://localhost:8080/api/products/${id}/name`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: editNameValue }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update name');
        setProducts((prev) => prev.map((p) => p.product_id === id ? { ...p, product_name: editNameValue } : p));
        toast.success('Product name updated!', { position: 'top-center' });
        setEditNameId(null);
        setEditNameValue("");
      })
      .catch((error) => {
        toast.error('Failed to update name.', { position: 'top-center' });
        console.error(error);
      });
  };

  // Edit price handler
  const startEditPrice = (id: number, currentPrice: number) => {
    setEditPriceId(id);
    setEditPriceValue(String(currentPrice));
    setDropdownOpen(null);
    setEditNameId(null);
  };
  const cancelEditPrice = () => {
    setEditPriceId(null);
    setEditPriceValue("");
  };
  const saveEditPrice = (id: number) => {
    fetch(`http://localhost:8080/api/products/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: editPriceValue }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update price');
        setProducts((prev) => prev.map((p) => p.product_id === id ? { ...p, price: editPriceValue } : p));
        toast.success('Product price updated!', { position: 'top-center' });
        setEditPriceId(null);
        setEditPriceValue("");
      })
      .catch((error) => {
        toast.error('Failed to update price.', { position: 'top-center' });
        console.error(error);
      });
  };

  // Open category modal
  const openCategoryModal = (id: number, currentCategory: string) => {
    setCategoryModal({ open: true, id });
    setSelectedCategory(currentCategory);
    setDropdownOpen(null);
    setEditNameId(null);
    setEditPriceId(null);
  };
  const closeCategoryModal = () => {
    setCategoryModal({ open: false, id: null });
    setSelectedCategory("");
  };
  const submitCategoryChange = () => {
    if (categoryModal.id == null) return;
    fetch(`http://localhost:8080/api/products/${categoryModal.id}/category`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: selectedCategory }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update category');
        setProducts((prev) => prev.map((p) => p.product_id === categoryModal.id ? { ...p, category: selectedCategory } : p));
        toast.success('Product category updated!', { position: 'top-center' });
        closeCategoryModal();
      })
      .catch((error) => {
        toast.error('Failed to update category.', { position: 'top-center' });
        console.error(error);
      });
  };

  // Open dropdown and calculate position
  const openDropdown = (id: number) => {
    setDropdownOpen(id);
    setTimeout(() => {
      const btn = penRefs.current[id];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY + 8,
          left: rect.right + window.scrollX - 160, // 160 = dropdown width
        });
      }
    }, 0);
  };
  const closeDropdown = () => {
    setDropdownOpen(null);
    setDropdownPos(null);
  };

  const isModalOpen = deleteModal.open || categoryModal.open;

  return (
    <div className="main-content app-content bg-blue-100 min-h-screen" style={{ marginTop: 0 }}>
      <ToastContainer position="top-center" autoClose={1500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {/* Blur wrapper for all content except modals */}
      <div className={isModalOpen ? "filter blur pointer-events-none select-none" : ""}>
        <SideMenu />
        <div className="container-fluid">
          {/* Top Summary */}
          <div className="grid grid-cols-12 gap-x-6">
            <div className="xl:col-span-12 col-span-12">
              <div className="box">
                <div className="box-body px-4 py-3">
                  <div className="grid grid-cols-12 gap-x-6 items-center gap-y-2">
                    <div className="sm:col-span-8 col-span-12">
                      <h6 className="mb-0">
                        Total{" "}
                        <span className="font-semibold text-primarytint1color">
                          {products.length} ITEMS
                        </span>{" "}
                        Available
                      </h6>
                    </div>
                    <div className="sm:col-span-4 col-span-12 text-right">
                      <Link
                        to="/Inventorys/create"
                        className="bg-primary text-white px-4 py-2 rounded-md shadow hover:bg-primary/80"
                      >
                        + Add Product
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="mb-6 flex gap-3 flex-wrap">
            {filterCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1 rounded-full border text-sm ${
                  activeCategory === cat.value
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-12 gap-x-6 mt-6">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.product_id || idx}
                className="xl:col-span-3 lg:col-span-4 sm:col-span-6 col-span-12"
              >
                <div
                  className={`box card-style-2 shadow-xl relative ${
                    product.stock < 20 ? "border border-red-300" : ""
                  }`}
                >
                  {product.isNew && (
                    <div className="absolute top-2 left-2">
                      <div className="badge bg-info text-white">New</div>
                    </div>
                  )}

                  <div className="card-img-top border-b border-dashed bg-light h-40 flex items-center justify-center">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="h-full object-contain"
                      onError={e => (e.currentTarget.src = defaultImage)}
                    />
                  </div>

                  <div className="relative rounded-xl bg-white/90 shadow-inner overflow-visible" style={{ zIndex: 100, paddingTop: 40 }}>
                    {/* Pen Icon Dropdown - move further right for visibility */}
                    <div className="absolute top-2 z-50" style={{ right: '1px' }}>
                      <button
                        ref={el => { penRefs.current[product.product_id] = el; }}
                        onClick={() => dropdownOpen === product.product_id ? closeDropdown() : openDropdown(product.product_id)}
                        className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center shadow"
                        title="Manage Product"
                        style={{ zIndex: 51 }}
                      >
                        <FaPen />
                      </button>
                      {dropdownOpen === product.product_id && dropdownPos && ReactDOM.createPortal(
                        <div
                          className="fixed w-36 bg-white border border-gray-200 rounded shadow-lg z-[9999] animate-fadeIn"
                          style={{
                            minWidth: 140,
                            maxHeight: 160,
                            overflowY: 'auto',
                            pointerEvents: 'auto',
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                          }}
                        >
                          <button
                            onClick={() => startEditName(product.product_id, product.product_name || product.name)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Edit Name
                          </button>
                          <button
                            onClick={() => startEditPrice(product.product_id, product.price)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Edit Price
                          </button>
                          <button
                            onClick={() => openCategoryModal(product.product_id, product.category)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          >
                            Change Category
                          </button>
                          <button
                            onClick={() => { closeDropdown(); openDeleteModal(product.product_id); }}
                            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-red-600"
                          >
                            Delete
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                    <div className="p-4 pt-0">
                      {/* Edit Name Inline */}
                      {editNameId === product.product_id ? (
                        <div className="flex items-center gap-2 mb-2 mt-2">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={e => setEditNameValue(e.target.value)}
                            className="border border-teal-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
                            style={{ minWidth: 120 }}
                          />
                          <button
                            onClick={() => saveEditName(product.product_id)}
                            style={{
                              backgroundColor: '#22c55e', // Tailwind's bg-green-500
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a'; // Tailwind's bg-green-600
                            }}
                            onMouseOut={(e) => {
                              (e.target as HTMLButtonElement).style.backgroundColor = '#22c55e';
                            }}
                          >
                            Save
                          </button>
                          <button onClick={cancelEditName} className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition">Cancel</button>
                        </div>
                      ) : editPriceId === product.product_id ? (
                        <div className="flex items-center gap-2 mb-2 mt-2">
                          <input
                            type="number"
                            value={editPriceValue}
                            onChange={e => setEditPriceValue(e.target.value)}
                            className="border border-teal-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none shadow-sm"
                            style={{ minWidth: 80 }}
                          />
                        <button
                          onClick={() => saveEditPrice(product.product_id)}
                          style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#16a34a';
                          }}
                          onMouseOut={(e) => {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#22c55e';
                          }}
                        >
                          Save
                        </button>

                          <button onClick={cancelEditPrice} className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition">Cancel</button>
                        </div>
                      ) : (
                        <h5 className="font-semibold mb-1 text-lg truncate mt-2" title={product.product_name || product.name}>{product.product_name || product.name}</h5>
                      )}
                      <div className="mt-2 text-primary font-bold text-xl">
                        ₱{Number(product.price).toFixed(2)}
                      </div>
                      {/* Stock and Controls */}
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="font-medium">Stock:</span>
                          <span className="font-bold text-gray-800">{product.stock}</span>
                          {product.stock < 20 && (
                            <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium ml-2">Low Stock</span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => updateStock(product.product_id, -1)}
                            className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded-full font-bold text-lg transition"
                            title="Decrease Stock"
                          >
                            -
                          </button>
                          <button
                            onClick={() => updateStock(product.product_id, 1)}
                            className="px-3 py-1 bg-green-200 hover:bg-green-300 text-green-700 rounded-full font-bold text-lg transition"
                            title="Increase Stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modals are outside the blur wrapper so they are not blurred */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  backgroundColor: '#ef4444', // Tailwind's bg-red-500
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  border: 'none',
                  fontWeight: 500,
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#dc2626')} // Tailwind's bg-red-600
                onMouseOut={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Change Category</h2>
            <form onSubmit={e => { e.preventDefault(); submitCategoryChange(); }}>
              <div className="flex flex-col gap-3 mb-6 items-center justify-center w-full">
                <label className="flex flex-row items-center justify-center w-full gap-2">
                  <input type="radio" name="category" value="milktea" checked={selectedCategory === 'milktea'} onChange={() => setSelectedCategory('milktea')} />
                  MILKTEA
                </label>
                <label className="flex flex-row items-center justify-center w-full gap-2">
                  <input type="radio" name="category" value="smoothie" checked={selectedCategory === 'smoothie'} onChange={() => setSelectedCategory('smoothie')} />
                  SMOOTHIE
                </label>
                <label className="flex flex-row items-center justify-center w-full gap-2">
                  <input type="radio" name="category" value="iced tea" checked={selectedCategory === 'iced tea'} onChange={() => setSelectedCategory('iced tea')} />
                  ICED TEA
                </label>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#22c55e', // Tailwind's bg-green-500
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '9999px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    border: 'none',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#16a34a')} // Tailwind's bg-green-600
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
                  disabled={!selectedCategory}
                >
                  Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default InventoryList;
