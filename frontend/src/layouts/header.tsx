import { useState } from "react";
import bgImage from "../assets/bgH.png";
import ProfIcon from "../assets/prof.png";
import logs from '../assets/logs.png';


function Header() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  

  // Sample user data (replace with API data)

  return (
    <>
      {/* Header */}
      <header
        className="app-header sticky bg-gradient-to-r from-yellow-500 to-red-500 flex items-center justify-between px-8 py-4 rounded-b-3xl shadow-xl"
        id="header"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >


        <div className="main-header-container container-fluid flex items-center justify-between w-full">
          {/* Logo */}
          <div className="header-content-left">
            <a href="/" className="header-logo">
              <img
                src={logs}
                alt="logo"
                className="w-16 h-12 "
              />
            </a>
          </div>

          

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center hover:ring-2 hover:ring-white rounded-full transition-all"
            >
              <img
                src={ProfIcon}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white hover:opacity-80 transition-all"
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-10 border border-gray-300">
                <button
                  onClick={() => setShowProfile(true)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>Profile</span>
                </button>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>Settings</span>
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 transform transition-all scale-100 hover:scale-105">
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">User Profile</h2>

            <button
              onClick={() => setShowProfile(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg w-full transition-all hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
