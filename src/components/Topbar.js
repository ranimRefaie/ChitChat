'use client';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaChevronDown, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { closeSocket } from '@/lib/socket';
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";

export default function TopBar({ searchQuery, setSearchQuery }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState('/user.png');

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleLogout = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name && window.chatSocket) {
      window.chatSocket.emit('manual_logout');
      window.chatSocket.disconnect();
      window.chatSocket = null;
    }
    closeSocket();
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
          .then(res => res.json())
          .then(data => {
            if (data?.profilePic?.url) {
            setProfilePic(data.profilePic.url);
          }
           else {
            setProfilePic('/user.png'); 
          }
          })
          .catch(err => console.error('Failed to fetch profile:', err));
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-orange-400 shadow">
      {/* Logo */}
      <Link
        href="/"
        className={`text-xl font-bold text-white flex items-center gap-1 ${showSearch ? 'hidden sm:flex' : 'flex'}`}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="p-1 rounded-md border border-white/30 shadow-sm w-[80vw] sm:w-56 bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
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

        {/* Dropdown */}
        <div ref={dropdownRef} className={`relative ${showSearch ? 'hidden sm:block' : ''}`}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-1 cursor-pointer">
            <img src={profilePic} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
            <FaChevronDown className="text-gray-100" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-md rounded w-40 text-sm z-10">
              <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:bg-yellow-100">
                <FaRegEdit size={16}/>Edit Profile
              </Link>
              <button onClick={handleLogout} className=" flex items-center gap-2 w-full text-left px-4 py-2 text-gray-400 hover:bg-yellow-100">
               <HiOutlineLogout size={16}/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
