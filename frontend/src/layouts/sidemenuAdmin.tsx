import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BsPersonCircle } from 'react-icons/bs';
import { BiBarChartAlt2, BiBox, BiClipboard, BiMoney } from 'react-icons/bi';
import logo from '../assets/logo.png';

const SidemenuAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { path: '/dashboards', label: 'Dashboard', icon: <BiBarChartAlt2 /> },
    { path: '/PointOfSale', label: 'Order Management', icon: <BiBox /> },
    { path: '/Inventory', label: 'Inventory', icon: <BiClipboard /> },
    { path: '/Ingredients', label: 'Ingredients Stock', icon: <BiBox /> },
    { path: '/Sales', label: 'Sales', icon: <BiMoney /> },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside className={`app-sidebar fixed top-0 left-0 h-screen z-50 bg-white border-r border-gray-200 transition-all duration-500 ease-in-out shadow-md ${collapsed ? 'w-16' : 'w-56'}`}>
      {/* Header: Logo + Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <img src={logo} alt="Logo" className="transition-all duration-300 w-28 object-contain" />
        <button
          onClick={toggleSidebar}
          className="text-xl text-gray-700 transition-all duration-300 hover:text-blue-600"
        >
          {collapsed ? '➡' : '⬅'}
        </button>
      </div>

      {/* Profile */}
      <div className="flex items-center px-4 py-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl">
          <BsPersonCircle />
        </div>
        {!collapsed && (
          <div className="ml-3 text-sm">
            <div className="font-semibold text-gray-800">Admin</div>

          </div>
        )}
      </div>  

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ path, label, icon }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold shadow-inner'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Logout */}
      <div className="mt-auto px-4 py-4">
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 flex items-center gap-2 w-full"
        >
          <span className="text-xl">🚪</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default SidemenuAdmin;
