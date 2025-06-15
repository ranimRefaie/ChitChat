'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddContactPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();
   const mockUsers = [
    { username: 'ranim', bio: 'Available', avatar: '/girl.jpg' },
    { username: 'ahmad', bio: 'Busy', avatar: '/girl.jpg' },
    { username: 'alaa', bio: 'Away', avatar: '/girl.jpg' },
  ];

    const filtered = search
    ? mockUsers.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelectUser = (username) => {
    router.push(`/${username}`);
  };

  return (
    <div className="min-h-screen bg-orange-50">
        <div className="flex items-center justify-between px-4 py-3 shadow bg-orange-500 text-white">
        <button onClick={() => router.back()} className="text-xl">←</button>
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

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((user, index) => (
            <div
              key={index}
              onClick={() => handleSelectUser(user.username)}
              className="flex items-center gap-4 p-3 bg-white shadow rounded-lg cursor-pointer hover:bg-orange-100 transition"
            >
              <img
                src={user.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
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