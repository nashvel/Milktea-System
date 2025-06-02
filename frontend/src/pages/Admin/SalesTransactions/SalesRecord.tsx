import { useState, useEffect } from "react";
import SideMenu from "../../../layouts/sidemenuAdmin";

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface Transaction {
  id: number;
  date: string;
  products: Product[];
  totalAmount: number;
}

// Backend data interfaces
interface BackendProduct {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface BackendTransaction {
  transaction_id: number;
  transaction_date: string;
  total: string | number;
  products: BackendProduct[];
}

const TransactionModal = ({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h3 className="text-xl font-bold mb-4">Transaction Details</h3>
      <p><strong>Transaction ID:</strong> {transaction.id}</p>
      <p><strong>Date:</strong> {transaction.date}</p>
      <h4 className="mt-4 font-semibold">Items:</h4>
      <ul>
        {transaction.products.map((product, index) => (
          <li key={index}>
            {product.name} (x{product.quantity}) - ₱{product.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-bold">Total: ₱{transaction.totalAmount.toFixed(2)}</p>
      <div className="mt-4 flex justify-end">
        <button
          className="bg-red-500 text-white py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

function Sales() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/transactions');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.transactions)) {
          // Transform backend data to our frontend format
          const transformedData: Transaction[] = data.transactions.map((transaction: BackendTransaction) => ({
            id: transaction.transaction_id,
            date: new Date(transaction.transaction_date).toLocaleString(),
            products: transaction.products ? transaction.products.map((product: BackendProduct) => ({
              name: product.product_name,
              quantity: product.quantity,
              price: Number(product.price)
            })) : [],
            totalAmount: Number(transaction.total)
          }));
          
          setTransactions(transformedData);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
        
        // If API fails, show empty state instead of crashing
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filterByRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  const applyQuickFilter = (type: "daily" | "weekly" | "monthly") => {
    const now = new Date();
    const today = new Date(now.toISOString().slice(0, 10));
    let from = new Date(today);
    if (type === "weekly") from.setDate(today.getDate() - 7);
    else if (type === "monthly") from.setMonth(today.getMonth() - 1);
    setStartDate(from.toISOString().slice(0, 10));
    setEndDate(today.toISOString().slice(0, 10));
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toString().includes(searchTerm.toLowerCase()) ||
      transaction.products.some((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDate = filterByRange(transaction.date);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="main-content app-content">
      <div className="container-fluid">
        <SideMenu />

        <div className="grid grid-cols-12 gap-x-6 mt-6 items-end">
          <div className="col-span-12 md:col-span-3">
            <label className="block text-sm font-semibold mb-1">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className="block text-sm font-semibold mb-1">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className="block text-sm font-semibold mb-1">Search:</label>
            <input
              type="text"
              placeholder="Transaction ID or product"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="col-span-12 md:col-span-3 flex gap-2 mt-2 md:mt-6">
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
              onClick={() => applyQuickFilter("daily")}
            >
              Today
            </button>
            <button
              className="bg-green-500 text-white px-3 py-2 rounded text-sm"
              onClick={() => applyQuickFilter("weekly")}
            >
              This Week
            </button>
            <button
              className="bg-purple-500 text-white px-3 py-2 rounded text-sm"
              onClick={() => applyQuickFilter("monthly")}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="box p-4 shadow-lg mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Transaction ID</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Items Sold</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="px-4 py-2">{transaction.id}</td>
                      <td className="px-4 py-2">{transaction.date}</td>
                      <td className="px-4 py-2">
                        <ul>
                          {transaction.products.map((product, i) => (
                            <li key={i}>
                              {product.name} (x{product.quantity}) - ₱
                              {product.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2 font-bold">
                        ₱{transaction.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-blue-500 text-white py-1 px-3 rounded"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
}

export default Sales;
