'use client'

import { useCallback, useEffect, useState } from "react"
import { MarketCard } from "./MarketCard"
import { useMarket } from "./MarketsProvider"


export const RecentMarkets = () => {
    const { markets } = useMarket()

    const activeMarkets = markets
        ?.filter((market) => market.status === "ACTIVE")
        .sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 8);


    return (
        <div className="px-4 sm:px-6 lg:px-48 py-12 md:py-24 flex flex-col md:flex-row items-center w-full">
            <div className="flex flex-col items-start gap-y-4 w-full md:w-1/2 mb-8 md:mb-0">
                <div className="text-5xl sm:text-6xl lg:text-8xl font-semibold">Trade when</div>
                <div className="text-5xl sm:text-6xl lg:text-8xl font-semibold">you like,</div>
                <div className="text-2xl sm:text-3xl lg:text-5xl font-semibold">on what you like.</div>
            </div>
            <div className="w-full md:w-1/2 overflow-x-auto md:overflow-x-hidden md:h-[600px] md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                <div className="flex md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 pb-4 md:pb-0">
                    {activeMarkets?.map((market) => (
                        <MarketCard
                            key={market.id}
                            market={market}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}