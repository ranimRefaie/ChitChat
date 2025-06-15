'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMoon, FaSun, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';


export default function TopBar() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
const handleLogout = () => { localStorage.removeItem('user'); router.push('/auth/login'); };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowSearch(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-orange-500 flex items-center">
        <img src='/chat.png' className='w-11'/>
        ChitChat
      </div>

      {/* Right: Icons */}
      <div className="flex items-center space-x-4">
        {/* Search Icon */}
        <div ref={searchRef} className="relative">
          <button onClick={() => setShowSearch(!showSearch)} className="text-gray-600 dark:text-gray-300 hover:text-orange-500">
            <FaSearch />
          </button>
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              className="absolute right-0 top-full mt-2 p-2 border border-gray-300 rounded w-48 dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        {/* Dark/Light Toggle */}
        <button onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300 hover:text-orange-500">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* User Icon + Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-1">
            
            <img src='/girl.jpg' className='w-8 h-8 rounded-full border'/>
            <FaChevronDown className="text-gray-600 dark:text-gray-300 " />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-700 shadow-md rounded w-40 text-sm z-10">
    <Link
              href="/settings"
              className="block px-4 py-2 hover:dark:bg-gray-600"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:dark:bg-gray-600"
            >
              Logout
            </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}