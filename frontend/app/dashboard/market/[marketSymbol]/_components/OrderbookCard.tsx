'use client'
import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/app/dashboard/_components/WebsocketProvider";

interface OrderbookEntry {
    quantity: number;
}

interface Orderbook {
    [price: string]: OrderbookEntry;
}

interface OrderbookResponse {
    data: {
        success: boolean;
        data?: {
            yesOrderBook: Orderbook;
            noOrderBook: Orderbook;
        };
        message?: string;
        error?: string;
    };
}

const OrderbookCard = ({ marketSymbol }: { marketSymbol: string }) => {
    const { ws, isConnected } = useWebSocket();
    const [yesOrderbook, setYesOrderbook] = useState<Orderbook>({});
    const [noOrderbook, setNoOrderbook] = useState<Orderbook>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderbook = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/orderbook/${marketSymbol}`,
                { credentials: "include" }
            );
            const result: OrderbookResponse = await response.json();

            if (result.data.success && result.data.data) {
                setYesOrderbook(result.data.data.yesOrderBook || {});
                setNoOrderbook(result.data.data.noOrderBook || {});
            } else {
                setError(result.data.message || "Failed to fetch orderbook data");
            }
        } catch (err) {
            setError("Error fetching orderbook");
        } finally {
            setIsLoading(false);
        }
    }, [marketSymbol]);

    const handleOrderbookUpdate = useCallback(
        (event: MessageEvent) => {
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
            } catch (err) {
                console.error('Error processing orderbook update:', err);
            }
        },
        [marketSymbol]
    );

    useEffect(() => {
        fetchOrderbook();
    }, [fetchOrderbook]);

    useEffect(() => {
        console.log('WebSocket Effect - Connection Status:', {
            ws: !!ws,
            isConnected,
            wsReadyState: ws?.readyState
        });

        if (ws && isConnected) {
            const messageHandler = (event: MessageEvent) => {
                handleOrderbookUpdate(event);
            };

            ws.onmessage = messageHandler;
        }
    }, [ws, isConnected, handleOrderbookUpdate]);

    const sortedYesEntries = Object.entries(yesOrderbook)
        .map(([price, data]) => ({
            price: parseFloat(price),
            quantity: data.quantity
        }))
        .sort((a, b) => b.price - a.price);

    const sortedNoEntries = Object.entries(noOrderbook)
        .map(([price, data]) => ({
            price: parseFloat(price),
            quantity: data.quantity
        }))
        .sort((a, b) => b.price - a.price);

    const maxYesQuantity = Math.max(...sortedYesEntries.map(entry => entry.quantity), 0);
    const maxNoQuantity = Math.max(...sortedNoEntries.map(entry => entry.quantity), 0);

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="p-4">
                    <div className="h-40 flex items-center justify-center">
                        Loading orderbook...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="p-4">
                    <div className="h-40 flex items-center justify-center text-red-500">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mt-[30px] mb-[30px] min-h-[400px]">
            <CardContent className="p-4">
                <CardTitle className="py-4 text-2xl underline">Orderbook</CardTitle>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="grid grid-cols-2 mb-2">
                            <div className="text-sm font-medium">PRICE</div>
                            <div className="text-sm font-medium text-right">QTY AT YES</div>
                        </div>
                        {sortedYesEntries.length > 0 ? (
                            sortedYesEntries.map((entry, index) => (
                                <div key={`yes-${index}`} className="grid grid-cols-2 relative">
                                    <div className="z-10">{(entry.price / 100).toFixed(2)}</div>
                                    <div className="text-right z-10">{entry.quantity}</div>
                                    <div
                                        className="absolute inset-0 bg-blue-100 opacity-50"
                                        style={{
                                            width: `${(entry.quantity / maxYesQuantity) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-2">No YES orders</div>
                        )}
                    </div>

                    <div>
                        <div className="grid grid-cols-2 mb-2">
                            <div className="text-sm font-medium">PRICE</div>
                            <div className="text-sm font-medium text-right">QTY AT NO</div>
                        </div>
                        {sortedNoEntries.length > 0 ? (
                            sortedNoEntries.map((entry, index) => (
                                <div key={`no-${index}`} className="grid grid-cols-2 relative">
                                    <div className="z-10">{(entry.price / 100).toFixed(2)}</div>
                                    <div className="text-right z-10">{entry.quantity}</div>
                                    <div
                                        className="absolute inset-0 bg-red-100 opacity-50"
                                        style={{
                                            width: `${(entry.quantity / maxNoQuantity) * 100}%`,
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-2">No NO orders</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderbookCard;