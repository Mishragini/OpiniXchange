'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Trade {
    buyer: string;
    seller: string;
    price: number;
    quantity: number;
    marketSymbol: string;
    timestamp: string;
}

interface TradesContextType {
    trades: Trade[];
    setTrades: React.Dispatch<React.SetStateAction<Trade[]>>
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export const TradesProvider = ({ children, marketSymbol }: { children: React.ReactNode, marketSymbol: string }) => {
    const [trades, setTrades] = useState<Trade[]>([]);


    const fetchTrades = useCallback(async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/trades/${marketSymbol}`, {
            credentials: "include"
        })
        const result = await response.json();
        if (result.data.success) {
            setTrades(result.data.trades)
            return;
        }
        setTrades([])
    }, [])

    useEffect(() => {
        fetchTrades()
    }, [marketSymbol])

    return (
        <TradesContext.Provider value={{ trades, setTrades }}>
            {children}
        </TradesContext.Provider>
    );
};

export const useTrades = () => {
    const context = useContext(TradesContext);
    if (!context) {
        throw new Error('useTrades must be used within a TradesProvider');
    }
    return context;
};