import { BASE_URL } from '@/config';
import React, { createContext, useContext, useEffect, useState } from 'react';
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
    const socketUrl = BASE_URL.replace('api', '');
    const newSocket = io(socketUrl, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinPoll = (pollCode: string) => {
    if (socket) {
      socket.emit('joinPoll', pollCode);
      console.log(`Joining poll with code: ${pollCode}`);
    }
  };

  const leavePoll = (pollCode: string) => {
    if (socket) {
      socket.emit('leavePoll', pollCode);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinPoll, leavePoll }}>
      {children}
    </SocketContext.Provider>
  );
};
