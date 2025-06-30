'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useSearchParams, useParams } from 'next/navigation';
import TopBar from '@/components/TopbarChat';
import BottomBar from '@/components/BottomBar';
import MessageList from '@/components/MessageList';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import {getSocket}  from '@/lib/socket';

export default function ChatViewPage() {
  const router = useRouter();
  const { username } = useParams();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const [depth, setDepth] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); 
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const scrollRef = useRef(null);            
  const socketRef = useRef(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);
  const [typingFrom, setTypingFrom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [originalMessages, setOriginalMessages] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const firstMatchRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingText, setUploadingText] = useState('');



  // Init socket
  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;

    if (!socketRef.current && user?.name) {
      const globalSocket = getSocket();
      socketRef.current = globalSocket;
      globalSocket.emit('register', user.name);

      globalSocket.on('receive-message', (msg) => {
        const user = JSON.parse(localStorage.getItem('user'));
  const newMsg = {
    id: msg._id,
    text: msg.text || (msg.attachment?.originalName ?? 'Attachment'),
    time: new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fromMe: msg.senderName === user.name,
    isHTML: false,
    forwarded: msg.forwarded || false,
    attachment: msg.attachment || null,
    readAt: msg.readAt || null,

  };
  setMessages((prev) => [...prev, newMsg]);
  setShouldScrollToBottom(true);
  
    if (msg.senderName !== user.name) {
    socketRef.current?.emit('message_read', { messageId: msg._id });
  }

      });

      globalSocket.on('typing', ({ from }) => {
          if (from === username) setTypingFrom(from);
        console.log(`${from} is typing...`);
      });

      globalSocket.on('stop-typing', ({ from }) => {
          if (from === username) setTypingFrom(null);
        console.log(`${from} stopped typing.`);
      });

    globalSocket.on('user_status', ({ username: who, isOnline, lastOnline }) => {
        console.log(`[SOCKET] User status for ${who}: online=${isOnline}, lastOnline=${lastOnline}`);

    if (who.toLowerCase() === username.toLowerCase()) {
    setIsOnline(isOnline);
    setLastOnline(lastOnline);
  }
});

globalSocket.on('message_read_ack', ({ messageId, readAt }) => {
  setMessages(prev =>
    prev.map(msg =>
      msg.id === messageId ? { ...msg, read: true, readAt } : msg
    )
  );
});

  

      globalSocket.on('ping', () => {
        globalSocket.emit('pong');
      });
      

    }

    
}, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null;
        const token = user?.token;

        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/profile/${username}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
if (!profileRes.ok) {
  console.warn("User profile fetch failed");
} else {
  const profile = await profileRes.json();
  setUserData(profile);
}

        const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sender: (user?.name || '').trim().toLowerCase(),
  receiver: (username || '').trim().toLowerCase() })
        });

        console.log('Chat check params:', {
  sender: (user?.name || '').trim().toLowerCase(),
  receiver: (username || '').trim().toLowerCase()
});


         const chat = await checkRes.json();
        if (chat && chat._id) {
       setChatId(chat._id);
       } else {
        console.warn("No chat found");
       }
console.log('Chat check response:', chat);



if (chat && chat._id) {
  setChatId(chat._id);
} else {
  console.warn("Still no chat after retry");
}



       if (chat?._id) {
          const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/loadMessages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              chat: chat._id,
              depth: 0,
              date: new Date(0)
            })
          });

          const user = JSON.parse(localStorage.getItem('user'));
          const msgData = await msgRes.json();
          console.log("📨 Loaded messages from server:", msgData);
        msgData.messages.forEach((msg) => {
  if (!msg.read && msg.senderName !== user.name) {
    socketRef.current?.emit('message_read', { messageId: msg._id });
  }
});  
         const formattedMessages = msgData.messages.map(msg => ({
        id: msg._id,
        text: msg.text || (msg.attachment?.originalName ?? 'Attachment'),
        time: new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fromMe: msg.senderName === user.name,
        isHTML: msg.text?.includes('<mark>'), 
        attachment: msg.attachment || null,
        readAt: msg.readAt || null,
          forwarded: msg.forwarded || false,


      }));
        setMessages(formattedMessages);
        setOriginalMessages(formattedMessages);
        console.log("Formatted Messages:", formattedMessages);

        }
      } catch (err) {
        console.error(" Error fetching user/chat data:", err);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
  const fetchInitialStatus = async () => {
    if (!username) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/user/${username}/status` , {
         headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.warn("Status fetch failed:", res.status);
        return;
      }
      const data = await res.json();                        
      setIsOnline(data.isOnline);
      setLastOnline(data.lastOnline);
    } catch (err) {
      console.error("Failed to fetch initial user status", err);
    }
  };

  fetchInitialStatus();
}, [username]);


  // Send message
  const handleSend = async () => {
 if (!input.trim() || !chatId) {
    console.warn("Missing input or chatId");
    return;
  }    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.token;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: input,
        senderName: user.name,
        chatId: chatId,
        date: new Date(),
        read: false
      })
    });

    const data = await res.json();
    const normalizedMessage = {
  id: data._id,
  text: data.text || (data.attachment?.originalName ?? 'Attachment'),
  time: new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  fromMe: true, 
  isHTML: false,
  attachment: data.attachment || null,
  forwarded: data.forwarded || false,
};

setMessages((prev) => [...prev, normalizedMessage]);
setShouldScrollToBottom(true);
    setInput("");
    setShowEmojiPicker(false);

    socketRef.current?.emit('send-message', data, username);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input) {
        socketRef.current?.emit('typing', username);
      } else {
        socketRef.current?.emit('stop-typing', username);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);

 const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  if (isImage) {
    setUploadingText('Uploading image...');
  } else if (isPDF) {
    setUploadingText('Uploading file...');
  } else {
    setUploadingText('Uploading...');
  }

  setUploading(true);

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user.token;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderName', user.name);
    formData.append('chatId', chatId);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    

    const normalizedUpload = {
      id: data._id,
      text: data.text || (data.attachment?.originalName ?? 'Attachment'),
      time: new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fromMe: true,
      isHTML: false,
      attachment: data.attachment || null,
      forwarded: data.forwarded || false,
    };
    setShouldScrollToBottom(true);

    setMessages((prev) => [...prev, normalizedUpload]);
    socketRef.current?.emit('send-message', data, username);
  } catch (err) {
    console.error("Upload failed", err);
    toast.error("Upload failed");
  } finally {
    setUploading(false);
    setUploadingText('');
    

  }
};


  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Scroll to latest
useEffect(() => {
  if (shouldScrollToBottom) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, shouldScrollToBottom]);



  const loadMoreMessages = async (chatId, currentDepth = depth) => {
  if (!chatId || loadingMore || !hasMore) return;
  setLoadingMore(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user.token;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/loadMessages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ chat: chatId, depth: currentDepth, date: new Date(0) })
  });

  const { messages: fetchedMessages, moreExists } = await res.json();

  const formatted = fetchedMessages.map(msg => ({
    id: msg._id,
    text: msg.text || (msg.attachment?.originalName ?? 'Attachment'),
    time: new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fromMe: msg.senderName === user.name,
    isHTML: msg.text?.includes('<mark>'),
    attachment: msg.attachment || null,
    readAt: msg.readAt || null,
  }));

setMessages(prev => {
  const combined = [...formatted, ...prev];
  const uniqueMessages = combined.filter((msg, index, self) =>
    index === self.findIndex(m => m.id === msg.id)
  );
  return uniqueMessages;
});
setShouldScrollToBottom(false);
  setHasMore(moreExists);
  setDepth(currentDepth + 1);
  setLoadingMore(false);
};

const handleScroll = () => {
  if (scrollRef.current?.scrollTop === 0 && hasMore && chatId) {
    loadMoreMessages(chatId);
  }
};

  // Emoji picker logic
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

 const handleSearch = async (query = searchQuery) => {
  if (typeof query !== 'string' || !query.trim()) {
    setMessages(originalMessages);
    setSearchResults([]);
    setShouldScrollToBottom(false);
    return;
  }
  if (!chatId) return;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/searchMessages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, q: searchQuery })
    });

    const data = await res.json();

    const formatted = data.map((msg, index) => ({
      id: msg._id,
      text: msg.text,
      time: new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fromMe: msg.senderName === user.name,
      isHTML: true,
      attachment: msg.attachment || null,
      readAt: msg.readAt || null,
      ref: index === 0 ? firstMatchRef : null,
    }));
    setMessages(formatted);
    setSearchResults(formatted);
    setShouldScrollToBottom(false);
  } catch (err) {
    console.error("Search failed", err);
  }
};
useEffect(() => {
  if (firstMatchRef.current) {
    firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, [messages]);

const handleDelete = async (messageId) => {

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/data/message/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (data.success) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted!');
    } else {
      console.warn("Delete failed", data.error);
    }
  } catch (err) {
    console.error("Delete error", err);
  }
};


const handleAddForwardedMessage = (newMsg) => {
  if (newMsg.chatId !== chatId) {
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const normalizedMsg = {
    id: newMsg._id,
    text: newMsg.text || (newMsg.attachment?.originalName ?? 'Attachment'),
    time: new Date(newMsg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fromMe: newMsg.senderName === user.name,
    isHTML: false,
    attachment: newMsg.attachment || null,
    forwarded: newMsg.forwarded || false,
    readAt: newMsg.readAt || null,
  };
  setMessages(prev => [...prev, normalizedMsg]);
  setShouldScrollToBottom(true);
};




  return (
    <div className="h-screen flex flex-col bg-orange-50 relative">
<TopBar
 key={username + isOnline + lastOnline}
  userData={userData}
  username={username}
  isOnline={isOnline}
  lastOnline={lastOnline}
  typingFrom={typingFrom}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  onSearch={(q) => {
    if (!q) {
      setMessages([]);
      setOriginalMessages([]);
    } else {
      handleSearch(String(q || ''));
    }
  }}
  showSearch={showSearch}
  setShowSearch={setShowSearch}
/>

<div
  ref={scrollRef}
  onScroll={handleScroll}
  className="flex-1 overflow-y-auto p-4 space-y-2"
  style={{ scrollbarWidth: 'thin' }}
>
  {loadingMore && (
    <div className="flex justify-center items-center py-3">
      <ClipLoader size={28} color="#fb923c" />
    </div>
  )}
  
<MessageList 
 messages={searchResults.length > 0 ? searchResults : messages}
 bottomRef={bottomRef}
  handleDelete={handleDelete}
  onForward={handleAddForwardedMessage}
 />
</div>
   {showEmojiPicker && (
        <div ref={emojiRef} className="absolute bottom-20 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
        </div>
      )}

    {uploading && (
  <div className="flex justify-center items-center py-3">
    <ClipLoader size={22} color="#fb923c" />
    <span className="ml-2 text-sm text-orange-500">{uploadingText}</span>
  </div>
)}
      <BottomBar
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        setShowEmojiPicker={setShowEmojiPicker}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
      />
    </div>
  );
}
