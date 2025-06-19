'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

export default function AddContactPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = async () => {
    if (!search.trim()) return setResults([]);

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    const token = user?.token;

    if (!token) {
      console.error("🚨 No token found!");
      return;
    }

    try {
      console.log("🔐 Sending token:", token);

      const res = await fetch('https://quicklychat.onrender.com/api/data/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ search })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Server returned an error status:", res.status);
        console.log("📦 Raw response:", data);
        setResults([]);
        return;
      }
      console.log('data', data)
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSelectUser = (user) => {
  const name = encodeURIComponent(user.name);
  const img = encodeURIComponent(user.profilePic?.url || '');
 router.push(`/chats/${user.name}`);
};
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="flex items-center justify-between px-4 py-3 shadow bg-orange-500 text-white">
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

      <div className="space-y-3 px-4 pb-10">
        {results.length > 0 ? (
          results.map((user, index) => (
            <div
              key={index}
              onClick={() => handleSelectUser(user)}
              className="flex items-center gap-4 p-3 bg-white shadow rounded-lg cursor-pointer hover:bg-orange-100 transition"
            >
             <img
  src={
    user.profilePic?.url
      ? `https://quicklychat.onrender.com${user.profilePic.url}`
      : '/user.png'
  }
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
          <p className="text-center text-gray-500">No users found</p>
        ) : null}
      </div>
    </div>
  );
}