'use client'
import { useCallback, useEffect, useRef } from "react";
import { Appbar } from "../_components/Appbar";
import { DashboardMarkets } from "./_components/DashboardMarkets";
import { useAuth } from "../_components/AuthProvider";

export default function Page() {
    const wsRef = useRef<WebSocket | null>(null);
    const { user } = useAuth()

    const setupWebSocket = useCallback(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        wsRef.current = ws;

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (user) {
            setupWebSocket();
        }
    }, [user])


    return (
        <div className="min-h-screen">
            <DashboardMarkets />
        </div>

    )
}