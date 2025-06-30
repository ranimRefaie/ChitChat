'use client';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function ContactInfoPopup({ username, onClose }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const userContact = data.find((c) => c.name === username);
        setContact(userContact);
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [username]);

  if (!contact || loading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm sm:max-w-md text-center relative">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-orange-500 hover:text-orange-700 cursor-pointer"
          title="Back"
        >
          <FaArrowLeft size={20} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-orange-600">Contact Info</h2>

        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4">
          <img
            src={contact?.profilePic?.thumbnail || "/user.png"}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full border"
          />
        </div>

        <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{contact.name}</p>
        <p className="text-gray-600 text-sm sm:text-base mb-6  px-2">
          {contact.bio ? `${contact.bio} `: 'No bio available.'}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}