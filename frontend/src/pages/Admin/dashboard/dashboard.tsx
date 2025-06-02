import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Moon, Sun } from 'lucide-react';
import { DollarSign, Coffee, ClipboardList, BarChart2, ShoppingBag, User } from "lucide-react";
import SideMenu from "../../../layouts/sidemenuAdmin";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define interfaces for type safety
interface RecentOrder {
  id: number;
  mainProduct: string;
  total: number;
  timestamp: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string;
  }>;
}

function Dashboard() {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Low stock items from localStorage
  const [lowStockItems, setLowStockItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('lowStockItems') || '[]');
    } catch {
      return [];
    }
  });
  // Dashboard data states
  const [salesTotal, setSalesTotal] = useState<string>("0");
  const [ordersCount, setOrdersCount] = useState<string>("0");
  const [topProduct, setTopProduct] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chart data state
  const [chartData, setChartData] = useState({
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Weekly Sales',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#FF6347',
        backgroundColor: 'rgba(255, 99, 71, 0.2)',
        tension: 0.4,
      }
    ]
  });
  const [chartLoading, setChartLoading] = useState(true);
  
  // Recent orders state
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setChartLoading(true);
      setOrdersLoading(true);
      
      try {
        // Fetch sales today
        const salesResponse = await fetch('http://localhost:8080/api/dashboard/sales-today');
        const salesData = await salesResponse.json();
        if (salesData.success) {
          setSalesTotal(salesData.sales);
        }

        // Fetch orders this week
        const ordersResponse = await fetch('http://localhost:8080/api/dashboard/orders-week');
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setOrdersCount(ordersData.orders);
        }

        // Fetch top selling product
        const topProductResponse = await fetch('http://localhost:8080/api/dashboard/top-selling');
        const topProductData = await topProductResponse.json();
        if (topProductData.success) {
          setTopProduct(topProductData.product);
        }

        // Fetch chart data
        const chartResponse = await fetch('http://localhost:8080/api/dashboard/weekly-chart');
        const chartResponseData = await chartResponse.json();
        if (chartResponseData.success && chartResponseData.chartData) {
          setChartData({
            labels: chartResponseData.chartData.labels,
            datasets: [
              {
                label: 'Weekly Sales',
                data: chartResponseData.chartData.data,
                borderColor: '#FF6347',
                backgroundColor: 'rgba(255, 99, 71, 0.2)',
                tension: 0.4,
              }
            ]
          });
        }
        setChartLoading(false);
        
        // Load recent orders from localStorage instead of API
        loadRecentOrdersFromLocalStorage();

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to load recent orders from localStorage
  const loadRecentOrdersFromLocalStorage = () => {
    try {
      const storedOrders = localStorage.getItem('recentOrders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setRecentOrders(parsedOrders);
        setOrdersMessage('Showing recent orders from your sales');
      } else {
        setRecentOrders([]);
        setOrdersMessage('No recent orders found');
      }
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Listen for localStorage changes (for both low stock items and recent orders)
  useEffect(() => {
    const handleStorage = () => {
      setLowStockItems(JSON.parse(localStorage.getItem('lowStockItems') || '[]'));
      loadRecentOrdersFromLocalStorage();
    };
    
    window.addEventListener('storage', handleStorage);
    // Also poll every 2s in case of same-tab updates
    const interval = setInterval(handleStorage, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Toggle between dark and light mode
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Options with correct typings
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'line'>) => {
            return `₱${tooltipItem.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: function (tickValue: string | number) {
            return `₱${tickValue}`;
          },
        },
      },
    },
  };

  // Remove a low stock item from localStorage and UI
  const removeLowStockItem = (itemName: string) => {
    let lowStock = JSON.parse(localStorage.getItem('lowStockItems') || '[]');
    lowStock = lowStock.filter((item: string) => item !== itemName);
    localStorage.setItem('lowStockItems', JSON.stringify(lowStock));
    setLowStockItems(lowStock);
  };

  return (
    <div
      className={`main-content app-content ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-blue-100 text-gray-800'} min-h-screen transition-all duration-500 ease-in-out`}
    >
      <div className="container-fluid">
        <SideMenu />

        {/* Low Stock Toast Notifications */}
        {lowStockItems.length > 0 && (
          <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lowStockItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: 320,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(90,62,54,0.12), 0 1.5px 6px rgba(193,124,93,0.08)',
                  borderLeft: '6px solid #facc15',
                  padding: '1.25rem 2.5rem 1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  fontFamily: 'system-ui, sans-serif',
                  color: '#b45309',
                  fontWeight: 500,
                  animation: 'fadeIn 0.3s',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={e => {
                  // Prevent navigation if close button is clicked
                  if ((e.target as HTMLElement).closest('button')) return;
                  navigate('/Inventory');
                }}
                title="Go to Sales"
              >
                <span style={{ fontSize: 28, marginRight: 8 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Low Stock Warning</div>
                  <div style={{ fontSize: 16 }}>{item}</div>
                </div>
                <button
                  onClick={() => removeLowStockItem(item)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 14,
                    background: 'none',
                    border: 'none',
                    color: '#b45309',
                    fontSize: 22,
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-grow p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Milk Tea Dashboard</h1>
            <button
              className="p-2 rounded-full bg-teal-600 text-white transition-transform duration-200 hover:scale-105"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Sales Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className={`bg-white ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-teal-500 to-teal-300'} shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 ease-in-out`}>
              <CardContent className="p-6 flex items-center gap-6">
                <DollarSign className="text-white w-12 h-12" />
                <div className="flex flex-col">
                  <p className="text-sm text-black">Sales Today</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `₱${parseFloat(salesTotal).toLocaleString()}`
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className={`bg-white ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-orange-500 to-orange-300'} shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 ease-in-out`}>
              <CardContent className="p-6 flex items-center gap-6">
                <ShoppingBag className="text-white w-12 h-12" />
                <div className="flex flex-col">
                  <p className="text-sm text-black">Orders This Week</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      parseInt(ordersCount).toLocaleString()
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className={`bg-white ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-300'} shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 ease-in-out`}>
              <CardContent className="p-6 flex items-center gap-6">
                <Coffee className="text-white w-12 h-12" />
                <div className="flex flex-col">
                  <p className="text-sm text-black">Top-Selling Drink</p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      topProduct
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Weekly Sales Trend</h2>
            <div className="bg-white shadow-lg rounded-xl p-6">
              <div className="w-full" style={{ height: '300px' }}>
                {chartLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-lg text-gray-500 animate-pulse">Loading chart data...</div>
                  </div>
                ) : (
                  <Line data={chartData} options={options} />
                )}
              </div>
            </div>
          </div>

          {/* Inventory Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className={`bg-white ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 ease-in-out`}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Inventory Tracking</h2>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex justify-between">
                    <span>Tea Leaves</span>
                    <span className="font-semibold">50 packs</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sugar</span>
                    <span className="font-semibold">30 kg</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Milk</span>
                    <span className="font-semibold">20 liters</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className={`bg-white ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl transition-all duration-300 ease-in-out`}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                {ordersLoading ? (
                  <div className="py-8 text-center">
                    <div className="text-gray-500 animate-pulse">Loading recent orders...</div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders found</p>
                ) : (
                  <>
                    {ordersMessage && (
                      <p className="text-sm text-gray-500 mb-3">{ordersMessage}</p>
                    )}
                    <ul className="space-y-4 text-gray-700">
                      {recentOrders.map((order) => (
                        <li key={order.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <span className="font-medium">Order #{order.id.toString().slice(-4)}</span>
                            <div className="text-sm">{order.mainProduct}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.timestamp).toLocaleString()} • {order.products.length} items
                            </div>
                          </div>
                          <span className="text-green-600 font-semibold">₱{order.total.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
