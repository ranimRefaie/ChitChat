'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/Topbar';
import Link from 'next/link';
import { HiUserAdd } from "react-icons/hi";
import { getSocket } from '@/lib/socket';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }
    setUser(storedUser);
    fetchContacts(storedUser.token);

    if (!socketRef.current && storedUser?.name) {
      const globalSocket = getSocket();
      socketRef.current = globalSocket;
      globalSocket.emit('register', storedUser.name);

      globalSocket.on('typing', ({ from }) => {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.name.toLowerCase() === from.toLowerCase()
              ? { ...contact, typing: true }
              : contact
          )
        );
      });

      globalSocket.on('stop-typing', ({ from }) => {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.name.toLowerCase() === from.toLowerCase()
              ? { ...contact, typing: false }
              : contact
          )
        );
      });

      globalSocket.on('receive-message', (message) => {
        setContacts((prev) =>
          prev.map((contact) => {
            if (contact.name.toLowerCase() === message.senderName.toLowerCase()) {
              const prevCount = contact.lastMessage?.unreadCount || 0;
              return {
                ...contact,
                lastMessage: {
                  text: message.text,
                  time: message.date,
                  unreadCount: prevCount + 1,
                },
                typing: false,
              };
            }
            return contact;
          })
        );
      });

      globalSocket.on('ping', () => {
        globalSocket.emit('pong');
      });
    }

    const timeout = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchContacts = async (token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/contacts`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      const final = Array.isArray(data.contacts) ? data.contacts : data;
      setContacts(final);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col relative">
    
      <TopBar userData={user} username={user?.name} setSearchQuery={setSearchQuery} searchQuery={searchQuery} />

      <main className="flex-grow flex flex-col items-center text-center bg-orange-100 px-2 pt-2">
        {Array.isArray(filteredContacts) && filteredContacts.length > 0 ? (
          <div className="w-full">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => router.push(`/chats/${encodeURIComponent(contact.name)}`)}
                className="flex items-center justify-between bg-white px-4 py-3 mb-2 rounded shadow border border-gray-200 hover:bg-gray-100 transition cursor-pointer w-full"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={contact.profilePic?.thumbnail 
                         ? contact.profilePic.thumbnail
                         : '/user.png'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {contact.typing
                        ? <span className="text-orange-300">typing...</span>
                        : contact.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {contact.lastMessage?.time
                      ? new Date(contact.lastMessage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  {contact.lastMessage?.unreadCount > 0 && (
                    <span className="mt-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      {contact.lastMessage.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700 mb-4 text-lg">No conversations yet</p>
        )}
      </main>

      <Link
        href="/add-contact"
        className="fixed bottom-6 right-6 bg-orange-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-orange-600 transition text-3xl z-40"
        title="Add Contact"
      >
        <HiUserAdd />
      </Link>
    </div>
  );
}
