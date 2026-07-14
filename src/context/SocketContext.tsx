import { SOCKET_URL } from '@/config';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinPoll: (pollCode: string) => void;
  leavePoll: (pollCode: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinPoll: () => {},
  leavePoll: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[SOCKET] Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[SOCKET] Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`[SOCKET] Reconnected after ${attempt} attempts`);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      newSocket.removeAllListeners();
    };
  }, []);

  const joinPoll = useCallback(
    (pollCode: string) => {
      if (socket && isConnected) {
        socket.emit('joinPoll', pollCode);
      } else {
        console.warn('[SOCKET] Cannot join poll - socket not connected');
      }
    },
    [socket, isConnected]
  );

  const leavePoll = useCallback(
    (pollCode: string) => {
      if (socket && isConnected) {
        socket.emit('leavePoll', pollCode);
      }
    },
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinPoll, leavePoll }}>
      {children}
    </SocketContext.Provider>
  );
};
