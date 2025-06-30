import io from 'socket.io-client';

let socket = null;
let isRegistered = false;

export const getSocket = (username, forceRegister = false) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_BASE);

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      if (username) {
        socket.emit('register', username);
      }
    });

    socket.on('registered', () => {
      isRegistered = true;
      console.log('[Socket] Registered with server');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      isRegistered = false;
    });
  } 
  else if (socket.connected && username && (forceRegister || !isRegistered)) {
    socket.emit('register', username);
  }

  return socket;
};

export const isSocketRegistered = () => isRegistered;

export const closeSocket = () => {
  if (socket) {
    socket.emit('manual_logout');
    socket.disconnect();
    socket = null;
    isRegistered = false;
  }
};


