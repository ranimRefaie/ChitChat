'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { FiArrowLeft, FiSearch, FiMoreVertical, FiSend, FiSmile, FiPaperclip } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

export default function ChatViewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, fromMe: false, text: 'Hello!', time: '10:00 AM' },
    { id: 2, fromMe: true, text: 'Hey there!', time: '10:01 AM' },
  ]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now(),
      fromMe: true,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        fromMe: true,
        text: ` <img src="${reader.result}" class="w-32 rounded-lg" />`,
        isHTML: isImage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };
    reader.readAsDataURL(file);
  };

  // ✅ إغلاق الإيموجي عند الضغط خارجه
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-orange-50 relative">
      {/* ✅ Top Bar */}
      <div className="flex items-center justify-between p-3 bg-white shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><FiArrowLeft size={22} /></button>
          <img src="/girl.jpg" alt="User" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold">ranim</p>
            <p className="text-xs text-gray-500">online</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <FiSearch size={20} />
          <FiMoreVertical size={20} />
        </div>
      </div>

      {/* ✅ Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
       {messages.map((msg) => (
  <div
    key={msg.id}
    className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow 
      ${msg.fromMe ? 'bg-orange-500 text-white self-end ml-auto' : 'bg-white text-gray-800 self-start'}`}
  >
    {msg.isHTML ? (
      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
    ) : (
      <p>{msg.text}</p>
    )}
    <div className="text-[10px] text-right mt-1 opacity-60">{msg.time}</div>
  </div>
))}
        <div ref={bottomRef} />
      </div>

      {/* ✅ Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiRef} className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
        </div>
      )}
      {/* ✅ Input Area */}
      <div className="p-3 border-t bg-white flex items-center gap-2 relative">
        <button className="text-gray-500" onClick={() => setShowEmojiPicker((prev) => !prev)}>
          <FiSmile size={22} />
        </button>

        <button className="text-gray-500" onClick={() => fileInputRef.current.click()}>
          <FiPaperclip size={22} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <button onClick={handleSend} className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}