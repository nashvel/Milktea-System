import { Link } from "react-router-dom";
import SideMenu from "../../../layouts/sidemenuAdmin";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function IngredientsList() {
  // Ingredients states
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [restockModal, setRestockModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [restockAmount, setRestockAmount] = useState<string>('');
  const [restockNote, setRestockNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Add ingredient states
  const [addIngredientModal, setAddIngredientModal] = useState<boolean>(false);
  const [newIngredient, setNewIngredient] = useState<{
    name: string;
    description: string;
    unit: string;
    quantity: string;
  }>({ name: '', description: '', unit: '', quantity: '' });

  useEffect(() => {
    // Fetch ingredients
    setLoading(true);
    fetch("http://localhost:8080/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        if (data.ingredients) {
          setIngredients(data.ingredients);
        } else if (Array.isArray(data)) {
          setIngredients(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ingredients:", error);
        setLoading(false);
        toast.error("Failed to load ingredients");
      });
  }, []);

  // Functions for ingredient management
  const openRestockModal = (id: number) => {
    setRestockModal({ open: true, id });
    setRestockAmount('');
    setRestockNote('');
  };

  const closeRestockModal = () => {
    setRestockModal({ open: false, id: null });
  };
  
  const openAddIngredientModal = () => {
    setAddIngredientModal(true);
    setNewIngredient({ name: '', description: '', unit: '', quantity: '' });
  };
  
  const closeAddIngredientModal = () => {
    setAddIngredientModal(false);
  };

  const handleRestock = () => {
    if (!restockModal.id || !restockAmount || Number(restockAmount) <= 0) {
      toast.error('Please enter a valid quantity to restock');
      return;
    }

    const amount = Number(restockAmount);
    const ingredientId = restockModal.id;
    const userId = 1; // This should be the actual logged-in user ID

    // First update the ingredient quantity
    fetch(`http://localhost:8080/api/ingredients/${ingredientId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity_added: amount,
        notes: restockNote,
        restocked_by: userId
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to restock ingredient');
        return res.json();
      })
      .then(() => {
        // Update the local state
        setIngredients(prev => 
          prev.map(ing => 
            ing.ingredient_id === ingredientId 
              ? { ...ing, quantity: Number(ing.quantity) + amount } 
              : ing
          )
        );
        toast.success('Ingredient restocked successfully!');
        closeRestockModal();
      })
      .catch(error => {
        console.error('Error restocking ingredient:', error);
        toast.error('Failed to restock ingredient');
      });
  };
  
  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.unit || !newIngredient.quantity || Number(newIngredient.quantity) < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }
    
    const userId = 1; // This should be the actual logged-in user ID
    
    fetch('http://localhost:8080/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newIngredient.name,
        description: newIngredient.description,
        unit: newIngredient.unit,
        quantity: Number(newIngredient.quantity),
        created_by: userId
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add ingredient');
        return res.json();
      })
      .then(data => {
        // Add the new ingredient to the list
        setIngredients(prev => [...prev, data.ingredient]);
        toast.success('Ingredient added successfully!');
        closeAddIngredientModal();
      })
      .catch(error => {
        console.error('Error adding ingredient:', error);
        toast.error('Failed to add ingredient');
      });
  };

  // No longer need to track sidebar collapsed state as we're using a different layout

  return (
    <div className="main-content app-content bg-blue-100 text-gray-800 min-h-screen transition-all duration-500 ease-in-out">
      <div className="container-fluid">
        <SideMenu />
        <ToastContainer position="top-right" autoClose={2000} />

        {/* Main Content */}
        <div className="flex-grow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">INGREDIENTS</h1>
          <div className="flex space-x-4">
            <button
              onClick={openAddIngredientModal}
              className="rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Add Ingredient
            </button>
            <Link
              to="/Inventory"
              className="rounded-full bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Back to Products
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No ingredients found</td>
                  </tr>
                ) : (
                  ingredients.map((ingredient) => (
                    <tr key={ingredient.ingredient_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{ingredient.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{ingredient.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${Number(ingredient.quantity) < 500 ? 'text-red-600' : 'text-gray-900'}`}>
                          {ingredient.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openRestockModal(ingredient.ingredient_id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        </div>

      {/* Add Ingredient Modal */}
      {addIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Add New Ingredient</h2>
            <form onSubmit={e => { e.preventDefault(); handleAddIngredient(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter ingredient name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newIngredient.description}
                  onChange={e => setNewIngredient({...newIngredient, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter ingredient description"
                  rows={2}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newIngredient.unit}
                  onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., grams, ml, pieces"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={newIngredient.quantity}
                  onChange={e => setNewIngredient({...newIngredient, quantity: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter initial quantity"
                  required
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={closeAddIngredientModal}
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600"
                  disabled={!newIngredient.name || !newIngredient.unit || !newIngredient.quantity}
                >
                  Add Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Restock Ingredient</h2>
            <form onSubmit={e => { e.preventDefault(); handleRestock(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={restockNote}
                  onChange={e => setRestockNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter notes about this restock"
                  rows={3}
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={closeRestockModal}
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
                  disabled={!restockAmount || Number(restockAmount) <= 0}
                >
                  Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default IngredientsList;
