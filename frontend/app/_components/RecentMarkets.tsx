'use client'

import { useCallback, useEffect, useState } from "react"
import { MarketCard } from "./MarketCard"

interface Market {
    categoryId: string,
    description: string,
    endTime: string,
    id: string,
    lastPrice: number,
    sourceOfTruth: string,
    status: string,
    symbol: string,
    timestamp: string,
    totalVolume: number
}

export const RecentMarkets = () => {
    const [markets, setMarkets] = useState<null | Market[]>(null)

    const fetchMarkets = useCallback(async () => {
        console.log("backend_url", process.env.NEXT_PUBLIC_BACKEND_URL)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/markets`);
        const result = await response.json();

        // Filter active markets and sort by timestamp (most recent first)
        const activeMarkets = result.data.markets
            .filter((market: Market) => market.status === "ACTIVE")
            .sort((a: Market, b: Market) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .slice(0, 8); // Take only the 8 most recent markets

        setMarkets(activeMarkets)
    }, [])

    useEffect(() => {
        fetchMarkets();
    }, [fetchMarkets])

    return (
        <div className="px-4 sm:px-6 lg:px-48 py-12 md:py-24 flex flex-col md:flex-row items-center w-full">
            <div className="flex flex-col items-start gap-y-4 w-full md:w-1/2 mb-8 md:mb-0">
                <div className="text-5xl sm:text-6xl lg:text-8xl font-semibold">Trade when</div>
                <div className="text-5xl sm:text-6xl lg:text-8xl font-semibold">you like,</div>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-semibold">on what you like.</div>
            </div>
            <div className="w-full md:w-1/2 overflow-x-auto md:overflow-x-hidden md:h-[600px] md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <div className="flex md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 pb-4 md:pb-0">
                    {markets?.map((market: Market) => (
                        <MarketCard
                            key={market.id}
                            title={market.symbol}
                            description={market.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}