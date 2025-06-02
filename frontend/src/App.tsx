import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./assets/css/style.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Inventory Pages
import InventoryRegistration from "./pages/Admin/Inventory/invent_register";
import InventoryList from "./pages/Admin/Inventory/inventory_list";
import IngredientsList from "./pages/Admin/Inventory/ingredients_list";
import SalesRecord from "./pages/Admin/SalesTransactions/SalesRecord";
import OrderManagement from "./pages/Admin/OrderManagement/OderManagement";
import Dashboard from "./pages/Admin/dashboard/dashboard";
import LoginPage from "./pages/Admin/LoginPage";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        {/* Redirect '/' to '/login' */}
        <Route path="/" element={<Navigate to="/login" />} />
       
        <Route path="/login" element={<LoginPage />} />

        {/* Inventory */}
        <Route path="/Inventorys/create" element={<InventoryRegistration />} />
        <Route path="/Inventory" element={<InventoryList />} />
        <Route path="/Ingredients" element={<IngredientsList />} />

        <Route path="/dashboards" element={<Dashboard />} />
        
        {/* Sales */}
        <Route path="/Sales" element={<SalesRecord />} />
        <Route path="/PointOfSale" element={<OrderManagement />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
