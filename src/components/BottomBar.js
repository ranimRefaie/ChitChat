 'use client'; import { FiSmile, FiPaperclip, FiSend } from 'react-icons/fi';
export default function BottomBar({ input, setInput, handleSend, setShowEmojiPicker, fileInputRef, handleFileUpload })
 { return ( 
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition"
        >
          <FiSend size={20} />
        </button>
      </div>
); } 