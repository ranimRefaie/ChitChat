'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSearch, FiMoreVertical, FiSend, FiSmile, FiPaperclip } from 'react-icons/fi';
import { EmojiPicker } from 'emoji-picker-react'; // تأكدي أنك منزلة مكتبة emoji-picker-react

export default function ChatViewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, fromMe: false, text: 'Hello!', time: '10:00 AM' },
    { id: 2, fromMe: true, text: 'Hey there!', time: '10:01 AM' },
  ]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const emojiRef = useRef();
  const bottomRef = useRef();

  // إرسال رسالة نصية
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), fromMe: true, text: input, time: new Date().toLocaleTimeString(), isHTML: false }]);
    setInput('');
  };

  // إرسال صورة أو ملف
 const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const isImage = file.type.startsWith('image/');
    const content = isImage
      ? <img src="${reader.result}" alt="Image" class="rounded-lg max-w-[200px] max-h-[200px]" />
      : <a href="${reader.result}" download class="text-blue-600 underline">${file.name}</a>;

    setMessages(prev => [...prev, {
      id: Date.now(),
      fromMe: true,
      text: content,
      time: new Date().toLocaleTimeString(),
      isHTML: true,
    }]);
  };
  reader.readAsDataURL(file);
};

  // إغلاق الإيموجي عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-orange-50">
      {/* ✅ Top Bar */}
      <div className="flex items-center justify-between p-3 bg-white shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><FiArrowLeft size={22} /></button>
          <img src="/girl.jpg" alt="User" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold">ranim</p>
            <p className="text-xs text-green-600">online</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <FiSearch size={20} />
          <FiMoreVertical size={20} />
        </div>
      </div>

      {/* ✅ Search */}
      <div className="px-4 pt-2">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* ✅ Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages
          .filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(msg => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2 rounded-xl text-sm shadow 
                ${msg.fromMe ? 'bg-orange-500 text-white self-end ml-auto' : 'bg-white text-gray-800 self-start'}`}
            >
             {msg.isHTML
  ? <div dangerouslySetInnerHTML={{ __html: msg.text }} />
  : <p>{msg.text}</p>
}
              <div className="text-[10px] text-right mt-1 opacity-60">{msg.time}</div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>
      {/* ✅ Input Area */}
      <div className="p-3 border-t bg-white flex items-center gap-2 relative">
        <div ref={emojiRef}>
          <button className="text-gray-500" onClick={() => setShowEmoji(!showEmoji)}>
            <FiSmile size={22} />
          </button>
          {showEmoji && (
            <div className="absolute bottom-16 left-2 z-50">
              <EmojiPicker
                onEmojiClick={(e, emojiObject) => setInput(prev => prev + emojiObject.emoji)}
                theme="light"
              />
            </div>
          )}
        </div>

        <label className="text-gray-500 cursor-pointer">
          <FiPaperclip size={22} />
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        <input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button onClick={handleSend} className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}