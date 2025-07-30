import { useCallback, useMemo, useState } from "react";
import { format } from 'date-fns';
import { Empty } from "@/app/_components/Empty";
import { Order, useOrders } from "../market/[marketSymbol]/_components/OrdersProvider";

type OrderStatus = "All" | "Pending" | "Partially_Filled" | "Cancelled" | "Filled";

interface OrderCardProps {
    order: Order;
    orderType: 'Buy' | 'Sell';
}

const OrderCard: React.FC<OrderCardProps> = ({ order, orderType }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchOrders } = useOrders()

    const handleCancel = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const endpoint = orderType === 'Buy'
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/cancel/buy`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/cancel/sell`;

            const response = await fetch(`${endpoint}?orderId=${order.id}&marketSymbol=${order.marketSymbol}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel order');
            }

            await response.json();
            fetchOrders()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel order');
        } finally {
            setIsLoading(false);
        }
    }, [order.id, order.marketSymbol, orderType]);

    return (
        <div className="bg-white shadow-md rounded-lg p-4 my-4">
            <div className="flex justify-between items-center">
                <div className="font-medium text-gray-800">
                    {order.side} Order
                </div>
                <div className="flex gap-6 items-center">
                    <div
                        className={`px-2 py-1 rounded-full text-sm font-medium ${order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-500'
                            : order.status === 'PARTIALLY_FILLED'
                                ? 'bg-blue-100 text-blue-500'
                                : order.status === 'FILLED'
                                    ? 'bg-green-100 text-green-500'
                                    : 'bg-red-100 text-red-500'
                            }`}
                    >
                        {order.status}
                    </div>
                    {(order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') && (
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`text-red-500 bg-transparent ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'}`}
                        >
                            {isLoading ? 'Cancelling...' : 'Cancel'}
                        </button>
                    )}
                </div>
            </div>
            {error && (
                <div className="mt-2 text-red-500 text-sm">
                    {error}
                </div>
            )}
            <div className="mt-2">
                <div className="text-gray-600">Market Symbol: {order.marketSymbol}</div>
                <div className="text-gray-600">Quantity: {order.quantity}</div>
                <div className="text-gray-600">Remaining Qty: {order.remainingQty}</div>
                <div className="text-gray-600">Price: ₹{(order.price / 100).toFixed(2)}</div>
                <div className="text-gray-600">
                    Timestamp: {format(new Date(order.timestamp), 'MM/dd/yyyy HH:mm:ss')}
                </div>
            </div>
        </div>
    );
};

interface OrdersProps {
    marketSymbol: string;
}

export const Orders: React.FC<OrdersProps> = () => {
    const [selectOrderType, setSelectOrderType] = useState<'Buy' | 'Sell'>('Buy');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('All');

    const { allBuyOrders, allSellOrders } = useOrders()


    const filteredOrders = useMemo(() => {
        let orders = selectOrderType === 'Buy' ? allBuyOrders : allSellOrders;
        if (selectedStatus !== 'All') {
            orders = orders?.filter((order) => order.status === selectedStatus.toUpperCase());
        }
        return orders;
    }, [selectOrderType, selectedStatus, allBuyOrders, allSellOrders]);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="flex gap-10">
                    <div onClick={() => setSelectOrderType('Buy')} className={`${selectOrderType === 'Buy' ? "underline text-black" : "text-gray-500"} text-xl font-semibold cursor-pointer`}>
                        BuyOrders
                    </div>
                    <div onClick={() => setSelectOrderType('Sell')} className={`${selectOrderType === 'Sell' ? "underline text-black" : "text-gray-500"} text-xl font-semibold cursor-pointer`}>
                        SellOrders
                    </div>
                </div>
                <div className="flex gap-5">
                    <div onClick={() => setSelectedStatus('All')} className={`${selectedStatus === 'All' ? "text-black" : "text-gray-500"} cursor-pointer`}>
                        All
                    </div>
                    <div onClick={() => setSelectedStatus('Pending')} className={`${selectedStatus === 'Pending' ? "text-black" : "text-gray-500"} cursor-pointer`}>
                        Pending
                    </div>
                    <div onClick={() => setSelectedStatus('Partially_Filled')} className={`${selectedStatus === 'Partially_Filled' ? "text-black" : "text-gray-500"} cursor-pointer`}>
                        Partially Filled
                    </div>
                    <div onClick={() => setSelectedStatus('Filled')} className={`${selectedStatus === 'Filled' ? "text-black" : "text-gray-500"} cursor-pointer`}>
                        Filled
                    </div>
                    <div onClick={() => setSelectedStatus('Cancelled')} className={`${selectedStatus === 'Cancelled' ? "text-black" : "text-gray-500"} cursor-pointer`}>
                        Cancelled
                    </div>
                </div>
            </div>
            <div className="my-2">
                {(!filteredOrders || filteredOrders.length === 0) && (
                    <Empty />
                )}
                {filteredOrders?.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        orderType={selectOrderType}
                    />
                ))}
            </div>
        </div>
    );
};