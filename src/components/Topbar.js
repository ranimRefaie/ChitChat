'use client';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMoon, FaSun, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState('/user.png'); 
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.profilePic && user.profilePic.url) {
        setProfilePic(`https://quicklychat.onrender.com${user.profilePic.url}`);
      }
    } catch (err) {
      console.error('❌ Error parsing user data:', err);
    }
  }
}, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowSearch(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-orange-500 shadow">
      {/* Logo */}
      <Link
        href="/"
        className={`text-xl font-bold text-white flex items-center gap-1 ${
          showSearch ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <img src="/logo.png" className="w-11" />
        ChitChat
      </Link>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div ref={searchRef} className="relative flex items-center gap-3">
          {showSearch && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setShowSearch(false)} className="text-white sm:hidden">
                <FaArrowLeft />
              </button>
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="p-1 rounded-md border border-white/30 shadow-sm w-[80vw] sm:w-56 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {!showSearch && (
            <button onClick={() => setShowSearch(true)} className="text-gray-100 hover:text-white cursor-pointer">
              <FaSearch />
            </button>
          )}
        </div>


        <button
          onClick={toggleDarkMode}
          className={`text-gray-100 hover:text-white cursor-pointer ${
            showSearch ? 'hidden sm:inline-block' : ''
          }`}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <div ref={dropdownRef} className={`relative ${showSearch ? 'hidden sm:block' : ''}`}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-1 cursor-pointer">
            <img src={profilePic} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
            <FaChevronDown className="text-gray-100" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 shadow-md rounded w-40 text-sm z-10">
              <Link href="/settings" className="block px-4 py-2 hover:dark:bg-gray-600">
                Edit Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:dark:bg-gray-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}