'use client';
import { FiMoreVertical, FiX } from 'react-icons/fi';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineClear } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";

function formatLastSeen(dateString, now = new Date()) {
  if (!dateString) return 'last seen: unknown';
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 60000);
  if (diff < 1) return 'last seen: just now';
  if (diff < 60) return `last seen: ${diff} min ago`;
  if (diff < 1440) return `last seen: ${Math.floor(diff / 60)}h ago`;

  return `last seen: ${date.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function TopBar({
  userData,
  username,
  isOnline,
  lastOnline,
  typingFrom,
  searchQuery,
  setSearchQuery,
  onSearch,
  showSearch,
  setShowSearch,
}) {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const searchRef = useRef();
const [showClearModal, setShowClearModal] = useState(false);
const [showRemoveModal, setShowRemoveModal] = useState(false);
  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (searchRef.current && !searchRef.current.contains(e.target)) ||
        (dropdownRef.current && !dropdownRef.current.contains(e.target))
      ) {
        setShowSearch(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, showDropdown]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleClearChat = async () => {

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user.token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sender: user.name, receiver: username })
      });

      const chat = await res.json();

      if (chat?._id) {
        const clearRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/clear/${chat._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await clearRes.json();

        if (result.success) {
          toast.success("Chat cleared!");
          onSearch(''); 
        } else {
          toast.error("Failed to clear chat.");
        }
      }
    } catch (err) {
      console.error("Clear chat error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleRemoveContact = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.token;

    const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ sender: user.name, receiver: username })
    });

    const chat = await checkRes.json();

    if (!chat?._id) {
      toast.error("Chat not found");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/contact/${chat._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (result.success) {
      toast.success("Contact removed");
      router.push('/chats');
      if (typeof onContactRemoved === 'function') onContactRemoved(username); // <- call prop
    } else {
      toast.error("Failed to remove contact");
    }
  } catch (err) {
    console.error("Remove contact error:", err);
    toast.error("Something went wrong");
  }
};



  return (
    <div className="flex items-center justify-between p-3 bg-orange-400 shadow relative">
      <div className="flex items-center gap-3">
        {showSearch ? (
          <button onClick={() => {
            setShowSearch(false);
            setSearchQuery('');
            onSearch('');
          }} className="sm:hidden text-orange-100">
            <FaArrowLeft size={18} />
          </button>
        ) : (
          <button onClick={() => router.back()} className='cursor-pointer'>
            <FaArrowLeft size={22} />
          </button>
        )}

        {!showSearch ? (
          <>
            <img
              src={
                userData?.profilePic?.url
                  ? userData.profilePic.url
                  : "/user.png"
              }
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-white">
                {userData?.name || username}
              </p>
              <p className="text-xs text-orange-100">
                {typingFrom
                  ? 'typing...'
                  : typeof isOnline === 'boolean'
                    ? isOnline
                      ? 'online'
                      : formatLastSeen(lastOnline, now)
                    : 'last seen: unknown'}
              </p>
            </div>
          </>
        ) : (
          <div ref={searchRef} className="flex gap-2 items-center relative">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search messages..."
              className="p-1 rounded-md border border-white/30 shadow-sm w-[80vw] sm:w-56 bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                  onSearch('');
                }}
                className="absolute right-2 text-gray-400 hover:text-red-500 text-xs"
              >
                <FiX size={18} />
              </button>
            )}
            <button
              onClick={onSearch}
              className="bg-white text-gray-300 p-1 cursor-pointer hover:bg-orange-50 rounded font-medium text-sm px-2"
            >
              Search
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-orange-100 relative">
        {!showSearch && (
          <>
            <button onClick={() => setShowSearch(true)} className='cursor-pointer'>
              <FaSearch size={18} />
            </button>

            <button onClick={() => setShowDropdown(!showDropdown)}>
              <FiMoreVertical size={20} />
            </button>

            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-12 right-0 z-50 bg-white border shadow-md rounded-lg p-2 w-44"
              >
                <button
                 onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-yellow-100 rounded-md"
                >
                  <AiOutlineClear size={20}/>
                  Clear Chat
                </button>
                <button
                 onClick={() => setShowRemoveModal(true)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md"
                >
                  <MdDeleteOutline size={20} />
                  Remove Contact
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Clear Chat Modal */}
{showClearModal && (
  <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center space-y-4">
      <p className="text-lg font-medium text-gray-800">Are you sure you want to clear this chat?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            handleClearChat();
            setShowClearModal(false);
          }}
          className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Yes
        </button>
        <button
          onClick={() => setShowClearModal(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* Remove Contact Modal */}
{showRemoveModal && (
  <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center space-y-4">
      <p className="text-lg font-medium text-gray-800">Remove this contact permanently?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            handleRemoveContact();
            setShowRemoveModal(false);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Remove
        </button>
        <button
          onClick={() => setShowRemoveModal(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}



