'use client';
import { useState } from 'react';
import { useMarket } from "@/app/_components/MarketsProvider";
import { useCategory } from "../../_components/CategoryProvider";
import { MarketCard } from "@/app/_components/MarketCard";
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const DashboardMarkets = () => {
    const { activeCategory } = useCategory();
    const { markets } = useMarket();
    const [sortOption, setSortOption] = useState('Trending');

    const categoryMarkets = (activeCategory === '') ?
        markets?.filter((market) => market.status === "ACTIVE")
        : markets?.filter((market) => market.status === "ACTIVE" && market.categoryTitle === activeCategory);

    const sortedMarkets = [...(categoryMarkets || [])].sort((a, b) => {
        if (sortOption === 'Trending') {
            return b.totalVolume - a.totalVolume;
        }
        if (sortOption === 'Expiring Soon') {
            return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    if (sortedMarkets?.length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div>
                    <Image
                        src='/empty.png'
                        width={300}
                        height={300}
                        alt="empty"
                    />
                    <div className="text-2xl font-bold mt-[20px] text-center">Nothing to show here... yet </div>
                </div>

            </div>
        )
    }

    return (
        <div className="px-12 md:px-24 lg:px-48 mt-32">
            <div className="flex justify-end mb-4">
                <Select
                    value={sortOption}
                    onValueChange={(value) => setSortOption(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Trending">Trending</SelectItem>
                        <SelectItem value="Expiring">Expiring Soon</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6">

                {sortedMarkets?.map((market) => (
                    <MarketCard key={market.id} market={market} />
                ))}
            </div>
        </div>
    );
};

