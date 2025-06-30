'use client';
import { useState, useEffect, useRef } from 'react';
import ForwardPopup from './ForwardPopup';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';
import { MdDeleteOutline } from "react-icons/md";
import { IoReturnDownForwardOutline } from "react-icons/io5";


export default function MessageList({ messages, bottomRef, handleDelete, onForward }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [contextMessageId, setContextMessageId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [forwardMsg, setForwardMsg] = useState(null);
  const dropdownRef = useRef(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleForward = (messageId) => {
    const msgToForward = messages.find((m) => m.id === messageId);
    setForwardMsg(msgToForward);
    setShowPopup(true);
  };

  const handleForwardSend = async (selectedContactIds, msg) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    for (const receiverId of selectedContactIds) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/user/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const receiver = await res.json();

        const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sender: user.name, receiver: receiver.name }),
        });
        const chat = await checkRes.json();
        const chatId = chat?._id;

        if (!chatId) {
          toast.error(`Chat not found with ${receiver.name}`);
          continue;
        }

        const payload = {
          senderName: user.name,
          chatId,
          date: new Date(),
          read: false,
          forwarded: true,
        };

        if (msg.attachment) {
          payload.attachment = msg.attachment;
        } else {
          payload.text = msg.text;
        }

        const sendRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await sendRes.json();
        if (onForward) {
          onForward(data);
        }

        const socket = getSocket();
        socket?.emit('send-message', data, receiver.name);

        toast.success(`Forwarded to ${receiver.name}`);
      } catch (err) {
        console.error('Error forwarding:', err);
        toast.error(`Failed to forward`);
      }
    }

    setShowPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setContextMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function formatReadAt(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Read at ${time}`;
  } else if (isYesterday) {
    return `Read yesterday at ${time}`;
  } else {
    return `Read on ${date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })} at ${time}`;
  }
}


  return (
    <>
      {messages.map((msg) => {
        const isSelected = selectedMessage === msg.id;
        const isFromMe = msg.fromMe;
        const showReadAt = isSelected && isFromMe && msg.readAt;

        return (
          <div
            key={msg.id}
            ref={msg.ref || null}
            className="flex flex-col mb-2"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMessageId(msg.id);
            }}
            onTouchStart={(e) => {
              e.persist();
              e.target.longPressTimer = setTimeout(() => {
                setContextMessageId(msg.id);
              }, 700);
            }}
            onTouchEnd={(e) => {
              clearTimeout(e.target.longPressTimer);
            }}
          >
            {/* Forwarded label */}
            {msg.forwarded && (
              <div className={`text-xs italic text-gray-500 mb-1 ${isFromMe ? 'self-end mr-2' : 'self-start ml-2'}`}>
                ↪ Forwarded
              </div>
            )}

            <div
              onClick={() =>
                setSelectedMessage((prev) => (prev === msg.id ? null : msg.id))
              }
              className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow cursor-pointer transition ${isFromMe
                  ? 'bg-orange-200 text-gray-800 self-end ml-auto'
                  : 'bg-white text-gray-800 self-start'
                }`}
            >
              {msg.attachment ? (
                msg.attachment.mimeType?.startsWith('image/') ? (
                  <img
                    src={msg.attachment.url}
                    alt={msg.attachment.originalName}
                    className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
                  />
                ) : msg.attachment.mimeType === 'application/pdf' ? (
                  <div
                    className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg max-w-xs cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      window.open(msg.attachment.url, '_blank')
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 truncate max-w-[255px] block">
                        {msg.attachment.originalName}
                      </span>
                      <span className="text-xs text-gray-600">
                        {(msg.attachment.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                ) : (
                  <a
                    href={msg.attachment.url}
                    download={msg.attachment.originalName}
                    className="text-blue-900 underline break-all"
                  >
                    📎 {msg.attachment.originalName}
                  </a>
                )
              ) : msg.isHTML ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              ) : (
                <p>{msg.text}</p>
              )}
              <div className="text-[10px] text-right mt-1 opacity-60">{msg.time}</div>
            </div>

            {/* Context Menu */}
            {contextMessageId === msg.id && (
              <div
                ref={dropdownRef}
                className={`mt-1 bg-white border rounded shadow z-50 text-sm w-[140px] ${isFromMe ? 'self-end mr-2' : 'self-start ml-2'
                  }`}
              >
                <button
                  onClick={() => {
                    setContextMessageId(null);
                    setMessageToDelete(msg.id);
                    setShowDeletePopup(true);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-red-100 text-red-600"
                >
                  <MdDeleteOutline size={20} />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setContextMessageId(null);
                    handleForward(msg.id);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-400 hover:bg-yellow-100"
                >
                  <IoReturnDownForwardOutline size={20} /> Forward
                </button>
              </div>
            )}

            {/* Read At */}
            {showReadAt && (
              <div className="text-[10px] text-gray-600 mt-1 text-right pr-1">
                ✅ {formatReadAt(msg.readAt)}
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />

      {showPopup && forwardMsg && (
        <ForwardPopup
          onClose={() => setShowPopup(false)}
          onSend={(selectedIds) => handleForwardSend(selectedIds, forwardMsg)}
        />
      )}

      {showDeletePopup && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg shadow-md w-80 text-center">
      <p className="mb-4 text-gray-800">Are you sure you want to delete this message?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            handleDelete(messageToDelete);
            setShowDeletePopup(false);
            setMessageToDelete(null);
          }}
          className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => {
            setShowDeletePopup(false);
            setMessageToDelete(null);
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}



