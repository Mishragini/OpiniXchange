'use client'
import { ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { createContext } from "react"
import { mockCategories } from "./CategoryProvider";

export interface Market {
    categoryId: string,
    categoryTitle: string,
    description: string,
    endTime: string,
    id: string,
    lastYesPrice: number,
    lastNoPrice: number,
    sourceOfTruth: string,
    status: string,
    symbol: string,
    timestamp: string,
    totalVolume: number
}

const mockMarkets: Market[] = Array.from({ length: 20 }, (_, index) => ({
    categoryId: `cat-${index + 1}`,
    categoryTitle: mockCategories[Math.floor(Math.random() * 6)].title,
    description: `Market ${index + 1} Description`,
    endTime: new Date(Date.now() + 86400000 * (index + 1)).toISOString(),
    id: `market-${index + 1}`,
    lastYesPrice: Math.round(Math.random() * 1000) / 100,
    lastNoPrice: Math.round(Math.random() * 1000) / 100,
    sourceOfTruth: 'Mock Data Source',
    status: ['ACTIVE', 'PENDING', 'CLOSED'][Math.floor(Math.random() * 3)],
    symbol: `MKT${index + 1}`,
    timestamp: new Date().toISOString(),
    totalVolume: Math.round(Math.random() * 100000)
}));

interface MarketContextType {
    markets: Market[] | null;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketsProvider = ({ children }: { children: ReactNode }) => {
    const [markets, setMarkets] = useState<null | Market[]>(null);

    const fetchMarkets = useCallback(async () => {
        try {
            console.log("backend_url", process.env.NEXT_PUBLIC_BACKEND_URL);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/markets`);
            const result = await response.json();

            const marketsData = result.data.markets?.length > 0
                ? result.data.markets
                : mockMarkets;

            setMarkets(marketsData);
        } catch (error) {
            console.error('Error fetching markets:', error);
            setMarkets(mockMarkets);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    return (
        <MarketContext.Provider value={{ markets }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => {
    const context = useContext(MarketContext);
    if (context === undefined) {
        throw new Error('useMarket must be used within an MarketProvider');
    }
    return context;
};