'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/Topbar';
import Link from 'next/link';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(true);
  const [contacts, setContacts] = useState([]); // mock data

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      router.push('/auth/login');
    } else {
      setUser(storedUser);
      const timeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col relative">
      {/* ✅ Success Toast */}
      {showToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white py-2 px-6 rounded shadow-md z-50">
          ✅ Successfully logged in
        </div>
      )}

      {/* ✅ Top Bar */}
      <TopBar />

      {/* ✅ Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        {contacts.length === 0 ? (
          <div>
            <p className="text-gray-700 mb-4 text-lg">No conversations yet</p>
          </div>
        ) : (
          <div>Your chats will appear here</div>
        )}
      </main>

      {/* ✅ Floating + Button */}
      {contacts.length === 0 && (
        <Link
          href="/add-contact"
          className="fixed bottom-6 right-6 bg-orange-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-orange-600 transition text-3xl z-40"
          title="Add Contact"
        >
          +
        </Link>
      )}
    </div>
  );
}