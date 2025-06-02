import React, { useState, useRef, useEffect } from "react";
import SideMenu from "../../../layouts/sidemenuAdmin";
import "./OrderManagementModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



interface ProductSize {
  name: string; // e.g., "Small", "Medium", "Large"
  price: number;
  stock: number; // Stock for this specific size
}

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  sizes: ProductSize[]; // Array of available sizes with their prices and stocks
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size: string; // To store the selected size in the order
}

function PointOfSale() {
  // Remove staticProducts
  // const staticProducts: Product[] = [...];

  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null); // New state for selected size
  const [quantity, setQuantity] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<string>("Cash");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const categories = ["All", "MILKTEA", "SMOOTHIE", "ICED TEA"];
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Add state for receipt confirmation
  const [askForReceipt, setAskForReceipt] = useState<boolean>(false);

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then(res => res.json())
      .then(data => {
        let backendProducts = data.products || [];
        // Map backend products to Product interface
        const mapped = backendProducts.map((p: any) => ({
          id: p.product_id,
          name: p.product_name,
          description: p.description || '',
          image: p.image ? `http://localhost:8080/images/product/${p.image}` : '',
          category: (p.category || '').toUpperCase(),
          sizes: [
            {
              name: p.size || 'Regular',
              price: Number(p.price),
              stock: Number(p.stock),
            },
          ],
        }));
        setProducts(mapped);
      })
      .catch(err => {
        setProducts([]);
        toast.error('Failed to fetch products from backend.');
      });
  }, []);

  // Reset quantity and error when selected product or size changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.sizes.length > 0) {
      // Set default size to the first available size if not already set
      if (!selectedSize || !selectedProduct.sizes.find(s => s.name === selectedSize.name)) {
        setSelectedSize(selectedProduct.sizes[0]);
      }
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
    setError("");
  }, [selectedProduct, selectedSize]);

  // Modal open with selected product
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    // Set initial selected size if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]); // Default to the first size
    } else {
      setSelectedSize(null);
    }
    setQuantity(1);
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
    setError("");
  };

  // Adjust quantity within stock limits for the selected size
  const handleQuantityChange = (delta: number) => {
    if (selectedProduct && selectedSize) {
      const newQuantity = quantity + delta;
      if (newQuantity < 1) return;
      if (newQuantity > selectedSize.stock) {
        setError(`Only ${selectedSize.stock} in stock for ${selectedSize.name}.`);
      } else {
        setQuantity(newQuantity);
        setError("");
      }
    }
  };

  // Add selected product and quantity to order
  const addToOrder = () => {
    if (!selectedProduct || !selectedSize) return;

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (quantity > selectedSize.stock) {
      setError(`Only ${selectedSize.stock} in stock for ${selectedSize.name}.`);
      return;
    }

    // Check if an item with the same name AND size already exists in the order
    const existing = order.find(
      (o) => o.name === selectedProduct.name && o.size === selectedSize.name
    );

    if (existing) {
      if (existing.quantity + quantity > selectedSize.stock) {
        setError(`Only ${selectedSize.stock} in stock for ${selectedSize.name}.`);
        return;
      }
      setOrder(
        order.map((o) =>
          o.name === selectedProduct.name && o.size === selectedSize.name
            ? { ...o, quantity: o.quantity + quantity }
            : o
        )
      );
    } else {
      setOrder([
        ...order,
        {
          name: selectedProduct.name,
          quantity,
          price: selectedSize.price,
          size: selectedSize.name,
        },
      ]);
    }
    closeModal();
  };

  // Remove item from order
  const removeItem = (name: string, size: string) => {
    toast.warn(`Removed ${name} (${size}) from cart.`);
    setOrder(order.filter((item) => !(item.name === name && item.size === size)));
  };

  // Edit quantity in order with stock check
  const editQuantity = (name: string, size: string, delta: number) => {
    setOrder(
      order.map((item) => {
        if (item.name === name && item.size === size) {
          // Find the product and its specific size to get the stock
          const product = products.find((p) => p.name === name);
          const productSize = product?.sizes.find((s) => s.name === size);

          if (!productSize) return item; // Should not happen if data is consistent

          const newQty = item.quantity + delta;
          if (newQty < 1) return item; // prevent zero or negative

          if (newQty > productSize.stock) {
            alert(`Only ${productSize.stock} in stock for ${productSize.name}.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Calculate total amount
  const getTotal = () => order.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Handle payment logic
  const handlePayment = () => {
    const total = getTotal();
    if (total === 0) {
      toast.error("Cart is empty. Please add items before checking out.");
      return;
    }

    let cashGivenAmount = 0;
    let changeAmount = 0;

    if (paymentType === "Cash") {
      cashGivenAmount = parseFloat(cashGiven);
      if (isNaN(cashGivenAmount) || cashGivenAmount < total) {
        toast.error("Insufficient cash.");
        return;
      }
      changeAmount = cashGivenAmount - total;
    }

    // Save order to localStorage for dashboard display
    try {
      // Get existing recent orders or initialize empty array
      const existingOrders = JSON.parse(localStorage.getItem('recentOrders') || '[]');
      
      // Add new order with timestamp
      const newOrder = {
        id: Date.now(), // Use timestamp as ID
        timestamp: new Date().toISOString(),
        products: order.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        total: total,
        paymentType: paymentType,
        mainProduct: order.length > 0 ? order[0].name : 'Unknown Product'
      };
      
      // Add to beginning of array (newest first)
      existingOrders.unshift(newOrder);
      
      // Keep only the 3 most recent orders
      const limitedOrders = existingOrders.slice(0, 3);
      
      // Save back to localStorage
      localStorage.setItem('recentOrders', JSON.stringify(limitedOrders));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    // Create sales records for each product in the order
    const saveOrderToBackend = async () => {
      try {
        // Get the first product in the order to create the primary sale
        if (order.length === 0) return;
        
        const firstOrderItem = order[0];
        const product = products.find(p => p.name === firstOrderItem.name);
        
        if (!product) return;
        
        // Prepare sales data
        const saleData = {
          product_id: product.id,
          payment_method: paymentType,
          quantity: firstOrderItem.quantity,
          cash_given: paymentType === "Cash" ? cashGivenAmount : null,
          change_amount: paymentType === "Cash" ? changeAmount : null,
          transaction: {
            customer: "", // Can add customer input field if needed
            total: total
          },
          transaction_products: order.map(item => {
            const prod = products.find(p => p.name === item.name);
            return {
              product_id: prod ? prod.id : 0,
              quantity: item.quantity,
            };
          })
        };
        
        // Send to backend
        const response = await fetch('http://localhost:8080/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save sale');
        }
        
        // Update product stock in the database for each product in the order
        await Promise.all(order.map(async (item) => {
          const productToUpdate = products.find(p => p.name === item.name);
          if (!productToUpdate) return;
          
          const sizeObj = productToUpdate.sizes.find(s => s.name === item.size);
          if (!sizeObj) return;
          
          // Calculate new stock
          const newStock = Math.max(0, sizeObj.stock - item.quantity);
          
          try {
            // Update the stock in the database
            const stockUpdateResponse = await fetch(`http://localhost:8080/api/products/${productToUpdate.id}/stock`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ stock: newStock }),
            });
            
            if (!stockUpdateResponse.ok) {
              console.error(`Failed to update stock for ${productToUpdate.name}`);
            }
            
            // Check if stock is low (less than 5) and add to localStorage for notification
            if (newStock < 5) {
              const lowStockItems = JSON.parse(localStorage.getItem('lowStockItems') || '[]');
              if (!lowStockItems.includes(productToUpdate.name)) {
                lowStockItems.push(productToUpdate.name);
                localStorage.setItem('lowStockItems', JSON.stringify(lowStockItems));
              }
            }
          } catch (error) {
            console.error(`Error updating stock for ${productToUpdate.name}:`, error);
          }
        }));
        
        // Update product stock locally for immediate UI update
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const orderItem = order.find(o => o.name === p.name);
            if (orderItem) {
              // Find the specific size that needs updating
              const updatedSizes = p.sizes.map(s => {
                if (s.name === orderItem.size) {
                  // Update stock for this size
                  return {
                    ...s,
                    stock: Math.max(0, s.stock - orderItem.quantity)
                  };
                }
                return s;
              });
              
              return {
                ...p,
                sizes: updatedSizes
              };
            }
            return p;
          });
        });
        
        toast.success('Checkout successful!');
        
        // Ask if user wants to see receipt
        setAskForReceipt(true);
        setIsPaymentOpen(false);
        
      } catch (error) {
        console.error('Error saving sale:', error);
        toast.error('Failed to save sale data. Please try again.');
      }
    };

    // Execute the save function
    saveOrderToBackend();
  };

  // Reset POS after payment
  const resetPOS = () => {
    setOrder([]);
    setCashGiven("");
    setIsPaymentOpen(false);
    setShowReceipt(false);
    setAskForReceipt(false);
    setPaymentType("Cash");
  };

  // Replace downloadReceipt with a simpler approach
  const downloadReceipt = () => {
    if (receiptRef.current) {
      // Create a timestamp for unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      try {
        // Get receipt content
        const receiptContent = receiptRef.current.innerHTML;
        
        // Create a simple HTML document with basic styling
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 16px; }
              table { width: 100%; }
              th { text-align: left; }
              td.right { text-align: right; }
              hr { margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${receiptContent}
            </div>
          </body>
          </html>
        `;
        
        // Convert to a downloadable data URL (text/html)
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `receipt-${timestamp}.html`;
        link.href = url;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        toast.success('Receipt downloaded!');
      } catch (error) {
        console.error('Error generating receipt:', error);
        toast.error('Failed to download receipt');
      }
    }
  };

  return (
    <div className="main-content app-content bg-blue-100 min-h-screen font-sans" style={{ marginTop: 0 }}>
      <SideMenu />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      
      {/* Ask for receipt modal */}
      {askForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Would you like a receipt?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setAskForReceipt(false);
                  setShowReceipt(true);
                }}
                className="px-6 py-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setAskForReceipt(false);
                  resetPOS();
                }}
                className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">POS Terminal</h1>

        {/* Categories */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1 rounded-full border text-sm ${
                activeCategory === cat
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Two-column layout with grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '2rem'
        }}>
          {/* Product List - Left column */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
              {products
                .filter((p) => activeCategory === "All" || p.category === activeCategory)
                .map((product) => (
                  <div
                    key={product.id}
                    onClick={() => openModal(product)}
                    className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-md transition transform hover:scale-105 cursor-pointer"
                  >
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-full mb-2" />
                    <h3 className="font-medium text-sm text-gray-800">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{product.description}</p>
                    {product.sizes.length > 1 ? (
                      <div className="text-gray-700 text-sm">
                        ₱{Math.min(...product.sizes.map(s => s.price))} - ₱{Math.max(...product.sizes.map(s => s.price))}
                      </div>
                    ) : (
                      <div className="text-gray-700 text-sm">₱{product.sizes[0].price}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Cart - Right column */}
          <div>
            <div className="bg-white rounded-lg shadow p-5 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Cart</h2>
              {order.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-80 overflow-y-auto text-sm">
                    {order.map((item, index) => (
                      <div key={index} className="border p-3 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name} {item.size !== "Regular" ? `(${item.size})` : ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₱{item.price} × {item.quantity} = ₱{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => editQuantity(item.name, item.size, -1)} className="px-2 py-1 rounded bg-gray-200">−</button>
                            <span className="px-2">{item.quantity}</span>
                            <button onClick={() => editQuantity(item.name, item.size, 1)} className="px-2 py-1 rounded bg-gray-200">+</button>
                            <button onClick={() => removeItem(item.name, item.size)} className="text-red-500 text-sm ml-2 hover:text-red-700">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-3 text-base flex justify-between font-medium">
                    <span>Total:</span>
                    <span>₱{getTotal().toFixed(2)}</span>
                  </div>

                  {/* Payment Section */}
                  <div className="mt-4">
                    {!isPaymentOpen ? (
                      <button
                        onClick={() => setIsPaymentOpen(true)}
                        style={{
                          width: '100%',
                          marginTop: '1rem',
                          padding: '0.9rem 1.5rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          background: order.length === 0
                            ? 'linear-gradient(90deg, #a7f3d0 0%, #6ee7b7 100%)'
                            : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                          color: order.length === 0 ? '#b1b1b1' : '#fff',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          boxShadow: order.length === 0
                            ? '0 1px 4px rgba(34,197,94,0.04)'
                            : '0 2px 8px rgba(34,197,94,0.10)',
                          cursor: order.length === 0 ? 'not-allowed' : 'pointer',
                          opacity: order.length === 0 ? 0.6 : 1,
                          transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
                        }}
                        disabled={order.length === 0}
                        onMouseOver={e => {
                          if (order.length !== 0) e.currentTarget.style.background = 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)';
                        }}
                        onMouseOut={e => {
                          if (order.length !== 0) e.currentTarget.style.background = 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
                        }}
                      >
                        Checkout
                      </button>
                    ) : (
                      <div className="payment-container mt-5 border-t pt-4">
                        <h3 className="text-lg font-semibold">Payment</h3>
                        <div className="payment-options mb-3">
                          <label className="inline-flex items-center mr-4">
                            <input
                              type="radio"
                              name="payment"
                              value="Cash"
                              checked={paymentType === "Cash"}
                              onChange={() => setPaymentType("Cash")}
                              className="form-radio"
                            />
                            <span className="ml-2">Cash</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="payment"
                              value="GCash"
                              checked={paymentType === "GCash"}
                              onChange={() => setPaymentType("GCash")}
                              className="form-radio"
                            />
                            <span className="ml-2">GCash</span>
                          </label>
                        </div>

                        <div className="payment-form-content" style={{
                          maxHeight: '200px',
                          height: 'auto',
                          overflowY: 'auto',
                          marginBottom: '10px',
                          padding: '5px'
                        }}>
                          {paymentType === "Cash" && (
                            <div>
                              <label className="block mb-1 font-medium">Cash Given (₱):</label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={cashGiven}
                                onChange={(e) => setCashGiven(e.target.value)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter cash amount"
                              />
                              {cashGiven && parseFloat(cashGiven) >= getTotal() && (
                                <p className="mt-1 text-green-600 font-semibold">
                                  Change: ₱{(parseFloat(cashGiven) - getTotal()).toFixed(2)}
                                </p>
                              )}
                            </div>
                          )}

                          {paymentType === "GCash" && (
                            <div className="mt-3 flex flex-col items-center">
                              <p className="mb-2">Scan this QR code to pay with GCash:</p>
                              <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                QR Placeholder
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between border-t pt-3">
                          <button
                            onClick={() => setIsPaymentOpen(false)}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePayment}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product quantity and size modal */}
        {isModalOpen && selectedProduct && (
          <div className="order-modal-overlay">
            <div className="order-modal-card">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="order-modal-close"
                aria-label="Close"
                type="button"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-3 text-[#5a3e36]">{selectedProduct.name}</h2>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-24 h-24 object-cover rounded-full mx-auto mb-3 border-4 border-[#f3e5d8]"
              />
              <p className="text-gray-600 mb-4 text-center">{selectedProduct.description}</p>

              {/* Size selection */}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium mb-2 text-[#5a3e36]">Select Size:</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {selectedProduct.sizes.map((sizeOption) => (
                      <button
                        key={sizeOption.name}
                        onClick={() => setSelectedSize(sizeOption)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                          selectedSize?.name === sizeOption.name
                            ? "bg-[#c17c5d] text-white border-[#c17c5d] shadow"
                            : "bg-gray-100 text-[#5a3e36] border-gray-200 hover:bg-[#f3e5d8]"
                        }`}
                      >
                        {sizeOption.name} (₱{sizeOption.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSize && (
                <>
                  <p className="font-medium mb-2 text-[#5a3e36]">Price: ₱{selectedSize.price}</p>
                  <p className="mb-4 text-sm text-gray-500">Stock: {selectedSize.stock}</p>

                  <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="w-16 text-center border rounded py-1"
                      value={quantity}
                      min={1}
                      max={selectedSize.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= selectedSize.stock) {
                          setQuantity(val);
                          setError("");
                        } else {
                          setError(`Quantity must be between 1 and ${selectedSize.stock}`);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </>
              )}

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #e0cfc2',
                    borderRadius: '0.5rem',
                    background: '#fff',
                    color: '#5a3e36',
                    fontWeight: 500,
                    fontSize: '1rem',
                    boxShadow: '0 1px 4px rgba(90,62,54,0.04)',
                    transition: 'background 0.2s, color 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f3e5d8')}
                  onMouseOut={e => (e.currentTarget.style.background = '#fff')}
                >
                  Cancel
                </button>
                <button
                  onClick={addToOrder}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(90deg, #c17c5d 0%, #a9654a 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(193,124,93,0.10)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    cursor: !selectedSize ? 'not-allowed' : 'pointer',
                    opacity: !selectedSize ? 0.6 : 1,
                  }}
                  disabled={!selectedSize}
                  onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #a9654a 0%, #c17c5d 100%)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #c17c5d 0%, #a9654a 100%)')}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div
            className="fixed inset-0 bg-white p-8 overflow-auto z-50"
            style={{ fontFamily: "monospace" }}
          >
            <div ref={receiptRef} className="max-w-md mx-auto p-6">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={downloadReceipt}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Download
                </button>
                <button 
                  onClick={resetPOS}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Close
                </button>
              </div>

              <h2 className="text-center font-bold mb-4">Milk Tea Shop Receipt</h2>
              <div className="mb-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Item</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name} {item.size !== "Regular" ? `(${item.size})` : ""}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">₱{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₱{getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                Thank you for your purchase!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PointOfSale;