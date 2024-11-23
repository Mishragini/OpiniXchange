// _components/WebsocketProvider.tsx
import { useAuth } from '@/app/_components/AuthProvider';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    ws: WebSocket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    isConnected: false,
    connect: () => { },
    disconnect: () => { },
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const { user } = useAuth()

    const connect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
        wsRef.current = ws;


        ws.onopen = () => {
            console.log('WebSocket connection established');
            setIsConnected(true);
        };



        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setIsConnected(false);
            wsRef.current = null;

        };

    };

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
            setIsConnected(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        connect();
    }, []);

    return (
        <WebSocketContext.Provider value={{
            ws: wsRef.current,
            isConnected,
            connect,
            disconnect
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};