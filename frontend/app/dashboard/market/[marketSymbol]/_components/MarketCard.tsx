'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TradesCard } from './TradesCard';
import { useWebSocket } from "@/app/dashboard/_components/WebsocketProvider";
import { Side } from './OrdersProvider';
import { OrderbookCard } from './OrderbookCard';

interface OrderbookEntry {
    quantity: number;
}

interface Orderbook {
    [price: string]: OrderbookEntry;
}

interface Trade {
    buyer: string;
    seller: string;
    price: number;
    quantity: number;
    marketSymbol: string;
    timestamp: string;
    side: Side
}

const MarketCard = ({ marketSymbol }: { marketSymbol: string }) => {
    const [activeView, setActiveView] = useState<'orderbook' | 'trades'>('orderbook');
    const { ws, isConnected } = useWebSocket();
    const [yesOrderbook, setYesOrderbook] = useState<Orderbook>({});
    const [noOrderbook, setNoOrderbook] = useState<Orderbook>({});
    const [trades, setTrades] = useState<Trade[]>([]);

    const handleWebSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            console.log('Parsed WebSocket message:', message);

            if (
                message.topic === 'orderbook-updates' &&
                message.data?.type === 'orderbook_update' &&
                message.data?.data?.marketSymbol === marketSymbol
            ) {
                const newData = message.data.data.data;
                console.log('Updating orderbook with:', newData);

                setYesOrderbook(prevYes => {
                    if (Object.keys(newData.yesOrderBook || {}).length === 0) {
                        return {};
                    }

                    const updatedYes = Object.keys(prevYes).reduce((result, price) => {
                        if (newData.yesOrderBook?.[price]) {
                            result[price] = newData.yesOrderBook[price];
                        }
                        return result;
                    }, {} as Orderbook);

                    return {
                        ...updatedYes,
                        ...newData.yesOrderBook
                    };
                });

                setNoOrderbook(prevNo => {
                    if (Object.keys(newData.noOrderBook || {}).length === 0) {
                        return {};
                    }

                    const updatedNo = Object.keys(prevNo).reduce((result, price) => {
                        if (newData.noOrderBook?.[price]) {
                            result[price] = newData.noOrderBook[price];
                        }
                        return result;
                    }, {} as Orderbook);

                    return {
                        ...updatedNo,
                        ...newData.noOrderBook
                    };
                });
            }

            console.log("topic", message.topic),
                console.log("type", message.data.type)
            console.log("marketSymbol", message.data?.marketSymbol)
            console.log("trades", message.data.data.trades)

            if (
                message.topic === 'market-updates' &&
                message.data.type === 'trade_update' &&
                message.data?.marketSymbol === marketSymbol
            ) {
                const newTrade = message.data.data.trades;
                setTrades(newTrade);
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    }, [marketSymbol]);

    useEffect(() => {
        console.log('WebSocket Effect - Connection Status:', {
            ws: !!ws,
            isConnected,
            wsReadyState: ws?.readyState
        });

        if (ws && isConnected) {
            ws.onmessage = handleWebSocketMessage;
        }
    }, [ws, isConnected, handleWebSocketMessage]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const orderbookResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/orderbook/${marketSymbol}`,
                    { credentials: "include" }
                );
                const orderbookResult = await orderbookResponse.json();
                if (orderbookResult.data.success && orderbookResult.data.data) {
                    setYesOrderbook(orderbookResult.data.data.yesOrderBook || {});
                    setNoOrderbook(orderbookResult.data.data.noOrderBook || {});
                }

                const tradesResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/trades/${marketSymbol}`,
                    { credentials: "include" }
                );
                const tradesResult = await tradesResponse.json();
                if (tradesResult.data.success) {
                    setTrades(tradesResult.data.trades);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
    }, [marketSymbol]);

    return (
        <Card className="w-full mt-[30px] mb-[30px] min-h-[400px]">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl">Market Data</CardTitle>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveView('orderbook')}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                activeView === 'orderbook'
                                    ? "text-foreground underline"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Orderbook
                        </button>
                        <button
                            onClick={() => setActiveView('trades')}
                            className={cn(
                                "text-sm font-medium transition-colors",
                                activeView === 'trades'
                                    ? "text-foreground underline"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Recent Trades
                        </button>
                    </div>
                </div>

                {activeView === 'orderbook' ? (
                    <OrderbookCard
                        yesOrderbook={yesOrderbook}
                        noOrderbook={noOrderbook}
                    />
                ) : (
                    <TradesCard trades={trades} />
                )}
            </CardContent>
        </Card>
    );
};

export default MarketCard;