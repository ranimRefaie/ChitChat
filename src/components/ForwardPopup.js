'use client';
import { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function ForwardPopup({ onClose, onSend }) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 10);

    const fetchContacts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/contacts`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch contacts');
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filtered = contacts.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col p-6 transform transition-all duration-300 ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-orange-600 text-center">Forward Message</h2>

        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* 📋 Contacts */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <p className="text-sm text-center text-gray-400">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-center text-gray-400">No contacts found</p>
          ) : (


           filtered.map((user) => {
  const isSelected = selectedIds.includes(user._id);
  return (
    <div
      key={user._id}
      className={`flex items-center gap-4 p-3 border-2 cursor-pointer relative transition ${
        isSelected ? 'bg-orange-50' : 'bg-white'
      } border-orange-500 hover:bg-orange-50 rounded-lg`}
      onClick={() => handleToggleSelect(user._id)}
    >
      <div className="relative">
        <img
          src={user.profilePic?.thumbnail 
             ? user.profilePic.thumbnail
             : '/user.png'}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border border-orange-300"
        />
        {isSelected && (
          <FaCheckCircle className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" size={18} />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-orange-500">{user.name}</p>
        <p className="text-sm text-gray-600 truncate">{user.bio}</p>
      </div>
    </div>
  );
})

          )}
        </div>

        {/* ✅ Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4 border-gray-300">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(selectedIds)}
            className={`px-4 py-2 rounded text-white font-medium transition ${
              selectedIds.length === 0
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
            disabled={selectedIds.length === 0}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
