'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function AddContactPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!search.trim()) return setResults([]);

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    const token = user?.token;
    if (!token) return;


    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ` Bearer ${token}`
        },
        body: JSON.stringify({ search })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Server error:", res.status);
        setResults([]);
        return;
      }

      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelectUser = async (user) => {
    const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    const token = currentUser?.token;
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toAdd: user.name })
      });

      const data = await res.json();
      const chatName = data.chat.sendName === currentUser.name 
  ? data.chat.recName 
  : data.chat.sendName;


      if (!res.ok || !data.chat) {
        console.error("Failed to add contact");
        return;
      }

      const name = encodeURIComponent(user.name);
      router.push(`/chats/${name}`);
      toast.success(`${user.name} added to contacts!`);

    } catch (err) {
      console.error("Error adding contact:", err);
    }
  };


  return (
    <div className="min-h-screen bg-orange-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 shadow bg-orange-400 text-white">
        <button onClick={() => router.back()} className="text-xl cursor-pointer">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Add Contact</h1>
        <div></div>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <div className="flex items-center bg-white rounded-lg shadow px-3 py-2">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
      </div>
      
      {/* Search Results */}
      <div className="space-y-3 px-4 pb-10">
    {isLoading ? (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-400 border-opacity-50"></div>
      </div>
    ) : results.length > 0 ? (
      results.map((user, index) => (
       <div
        key={index}
        onClick={() => handleSelectUser(user)}
        className="flex items-center gap-4 p-3 bg-white shadow rounded-lg cursor-pointer hover:bg-orange-100 transition"
      >
        <img
          src={user.profilePic?.thumbnail 
         ? user.profilePic.thumbnail
         : '/user.png'}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-orange-500">{user.name}</p>
          <p className="text-sm text-gray-600">{user.bio}</p>
        </div>
      </div>
      ))
    ) : search ? (
      <p className="empty-msg">No users found</p>
    ) : null}
  </div>
    </div>
  );
}