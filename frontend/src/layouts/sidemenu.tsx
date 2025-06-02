import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BiBarChartAlt2,
  BiBox,
  BiClipboard,
  BiMoney,
} from 'react-icons/bi';
import { BsPersonCircle } from 'react-icons/bs';
import logo from '../assets/logo.png';

const SidemenuAdmin = () => {
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) setCollapsed(savedState === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const navLinks = [
    { path: '/dashboards', label: 'Dashboard', icon: <BiBarChartAlt2 /> },
    { path: '/pos', label: 'Order Management', icon: <BiBox /> },
    { path: '/Inventory', label: 'Inventory', icon: <BiClipboard /> },
    { path: '/Ingredients', label: 'Ingredients', icon: <BiBox /> },
    {
      path: '/Sales',
      label: 'Sales',
      icon: <BiMoney />,
      badge: 2, // Example badge
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        {!collapsed && (
          <img
            src={logo}
            alt="Logo"
            className="transition-all duration-300 w-28 object-contain"
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '☰' : '×'}
        </button>
      </div>

      {/* Profile */}
      <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white text-xl">
          <BsPersonCircle />
        </div>
        {!collapsed && (
          <div className="ml-3 text-sm">
            <div className="font-semibold">Admin</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 overflow-y-auto max-h-[calc(100vh-200px)] px-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ path, label, icon, badge }) => {
            const isActive = location.pathname === path;

            return (
              <li key={path}>
                <Link
                  to={path}
                  title={collapsed ? label : undefined}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 dark:hover:from-gray-800 dark:hover:to-gray-700 dark:hover:text-white'
                  }`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-xl">{icon}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                  {badge && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-red-500 text-white rounded-full px-1.5">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Logout */}
      <div className="mt-auto px-4 py-4">
        <button
          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 w-full"
        >
          <span className="text-xl">🚪</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default SidemenuAdmin;
