import { useState } from "react";
import bgImage from "../assets/bgH.png";
import { FiLogOut } from "react-icons/fi"; // Profile Icons

function Headers() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header
        className="app-header sticky flex items-center justify-between px-6 py-3"
        id="header"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(245, 242, 235, 0.8), rgba(247, 240, 240, 0.8)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="main-header-container container-fluid flex items-center">
          {/* Logo */}
          <div className="header-content-left flex items-center">
            <a href="/" className="header-logo">
              <img
                src="/assets/images/brand-logos/desktop-logo.png"
                alt="logo"
                className="w-28"
              />
            </a>
          </div>

          {/* Logout Button */}
          <div className="relative ml-6">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center rounded-full hover:ring-2 hover:ring-white transition-all"
              aria-label="Logout"
            >
              <FiLogOut className="w-6 h-6 text-white" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-10 border border-gray-300">
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <FiLogOut className="w-5 h-5 text-gray-600" />
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Headers;
