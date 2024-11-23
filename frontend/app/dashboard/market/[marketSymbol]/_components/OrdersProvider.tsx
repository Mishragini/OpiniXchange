import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react"

export enum OrderStatus {
    PENDING = "PENDING",
    FILLED = "FILLED",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    CANCELLED = "CANCELLED"
}
export enum Side {
    YES = "YES",
    NO = "NO"
}

export interface Order {
    id: string;
    userId: string;
    marketSymbol: string;
    side: Side;
    quantity: number;
    remainingQty: number;
    price: number;
    status: OrderStatus;
    timestamp: Date;
}
interface OrdersContext {
    allBuyOrders: Order[],
    allSellOrders: Order[],
    setAllBuyOrders: Dispatch<SetStateAction<Order[]>>,
    setAllSellOrders: Dispatch<SetStateAction<Order[]>>,
    fetchOrders: () => Promise<void>
}

const OrdersContext = createContext<OrdersContext | undefined>(undefined)

export const OrdersProvider = ({ marketSymbol, children }: { marketSymbol: string, children: ReactNode }) => {
    const [allBuyOrders, setAllBuyOrders] = useState<Order[]>([]);
    const [allSellOrders, setAllSellOrders] = useState<Order[]>([]);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${marketSymbol}/orders`, {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const result = await response.json();

            setAllBuyOrders(result.data.userBuyMarketOrders);
            setAllSellOrders(result.data.userSellMarketOrders);

        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }, [marketSymbol]);

    useEffect(() => {
        fetchOrders()
    }, [])
    return (
        <OrdersContext.Provider value={{ allBuyOrders, allSellOrders, setAllBuyOrders, setAllSellOrders, fetchOrders }}>
            {children}
        </OrdersContext.Provider>
    )
}

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
}