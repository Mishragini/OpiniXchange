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

export interface Orderbook {
    [price: number]: {
        quantity: number
    }
}

export enum OrderStatus {
    PENDING = "pending",
    FILLED = "filled",
    PARTIALLY_FILLED = "partially_filled",
    CANCELLED = "cancelled"
}

export interface User {
    id: string,
    username: string,
    email: string,
    password: string,
    role: string,
    balance: BalanceStore
}

export interface Market {
    id: string,
    symbol: string,
    description: string,
    endTime: Date,
    sourceOfTruth: string,
    categoryId: string,
    status: MarketStatus,
    resolvedOutcome?: Side
}

export interface Category {
    id: string,
    title: string,
    icon: string,
    description: string
}

export interface Position {
    quantity: number;
    locked: number;
}

export interface StockBalance {
    [marketSymbol: string]: {
        'yes'?: Position;
        'no'?: Position;
    };
}

export interface BalanceStore {
    stocks: StockBalance;
    INR: {
        available: number;
        locked: number;
    };
}

export enum Side {
    yes = "yes",
    no = "no"
}

export enum MarketStatus {
    active = "active",
    closed = "closed",
    resolved = "resolved"
}
