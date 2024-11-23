'use client'
import { Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react"
import { createContext } from "react"

export interface Market {
    categoryId: string,
    categoryTitle: string,
    description: string,
    endTime: string,
    id: string,
    lastYesPrice: number,
    lastNoPrice: number,
    sourceOfTruth: string,
    createdBy: string,
    status: string,
    symbol: string,
    timestamp: string,
    totalVolume: number
}



interface MarketContextType {
    markets: Market[] | [],
    setMarkets: Dispatch<SetStateAction<Market[]>>

}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketsProvider = ({ children }: { children: ReactNode }) => {
    const [markets, setMarkets] = useState<Market[]>([]);

    const fetchMarkets = useCallback(async () => {
        try {
            console.log("backend_url", process.env.NEXT_PUBLIC_BACKEND_URL);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/markets`);
            const result = await response.json();

            const marketsData = result.data.markets;

            setMarkets(marketsData);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    }, []);

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets]);

    return (
        <MarketContext.Provider value={{ markets, setMarkets }}>
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