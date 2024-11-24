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

export enum OrderStatus {
    PENDING = "PENDING",
    FILLED = "FILLED",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    CANCELLED = "CANCELLED"
}

export interface Orderbook {
    [price: number]: {
        quantity: number
    }
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
    categoryTitle: string,
    status: MarketStatus,
    lastYesPrice: number,
    lastNoPrice: number,
    totalVolume: number,
    resolvedOutcome?: Side
    timestamp: Date,
    createdBy: String
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
        'YES'?: Position;
        'NO'?: Position;
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
    YES = "YES",
    NO = "NO"
}

export enum MarketStatus {
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    RESOLVED = "RESOLVED"
}

export interface Trade {
    seller: string;
    buyer: string;
    quantity: number;
    price: number;
    timestamp: string;
    marketSymbol: string;
}

