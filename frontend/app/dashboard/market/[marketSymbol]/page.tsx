'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { Market } from "@/app/_components/MarketsProvider";
import { useWebSocket } from "../../_components/WebsocketProvider";
import PlaceOrderCard from './_components/PlaceOrderCard';
import { Orders } from '../../_components/Orders';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Timer, TrendingUp } from 'lucide-react';
import { useAuth } from '@/app/_components/AuthProvider';
import { OrdersProvider } from './_components/OrdersProvider';
import MarketCard from './_components/MarketCard';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function Page({ params }: {
    params: Promise<{
        marketSymbol: string;
    }>
}) {
    const resolvedParams = use(params);
    const { user } = useAuth();
    const { marketSymbol } = resolvedParams;
    const { ws, isConnected } = useWebSocket();
    const [market, setMarket] = useState<Market | null>(null);

    const fetchMarket = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/${marketSymbol}`);
            const result = await response.json();
            if (result.data.success) {
                setMarket(result.data.market)
                return;
            }

        } catch (error) {
            console.error('Error fetching market:', error);
        }
    }, [marketSymbol]);

    const subscribeToMarket = useCallback(() => {
        if (!ws || !isConnected || !marketSymbol) {
            console.warn('Cannot subscribe: WebSocket not ready', {
                wsExists: !!ws,
                isConnected,
                marketSymbol
            });
            return;
        }

        try {
            const subscribeMessage = JSON.stringify({
                type: 'subscribe',
                marketSymbol: marketSymbol
            });

            ws.send(subscribeMessage);

        } catch (error) {
            console.error('Failed to send subscribe message:', error);
        }
    }, [ws, isConnected, marketSymbol]);

    useEffect(() => {

        fetchMarket();
        if (!user) return;

        subscribeToMarket();

        return () => {
            if (ws && isConnected && marketSymbol) {
                try {
                    ws.send(JSON.stringify({
                        type: 'unsubscribe',
                        marketSymbol: marketSymbol
                    }));
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            }

        };
    }, [isConnected, ws, marketSymbol, fetchMarket, subscribeToMarket, user]);


    if (!market) {
        return (
            <div>market not found</div>
        )
    }

    return (
        <OrdersProvider marketSymbol={marketSymbol}>
            <div className="px-4 md:px-8 lg:px-12 py-8 min-h-screen mt-[50px]">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="text-sm">
                            {market.categoryTitle.toUpperCase()}
                        </Badge>
                        <Badge
                            variant={market.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-sm"
                        >
                            {market.status}
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
                        {market.description}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Latest Yes Price
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{market.lastYesPrice}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Latest No Price
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{market.lastNoPrice}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Volume
                            </CardTitle>
                            <Timer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{market.totalVolume}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                End Date
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {formatDate(market.endTime)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <MarketCard marketSymbol={marketSymbol} />
                    </div>
                    <div>
                        <PlaceOrderCard
                            lastYesPrice={market.lastYesPrice}
                            lastNoPrice={market.lastNoPrice}
                            marketSymbol={marketSymbol}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <Orders marketSymbol={marketSymbol} />
                </div>
            </div>
        </OrdersProvider>
    );
}