"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
interface User {
  balance: {
    INR: { available: number; locked: number };
    stocks: Stocks;
  };
  email: string;
  id: string;
  password: string;
  role: string;
  username: string;
}
export interface StockBalance {
  quantity: number;
  locked: number;
}

export interface StockTypes {
  YES: StockBalance;
  NO: StockBalance;
}

export interface Stocks {
  [symbol: string]: StockTypes;
}
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  checkAuth: () => Promise<void>;
  balance: {
    available: number;
    locked: number;
  };
  setBalance: Dispatch<
    SetStateAction<{
      available: number;
      locked: number;
    }>
  >;
  stocks: Stocks;
  setStocks: Dispatch<SetStateAction<Stocks>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState({ available: 0, locked: 0 });
  const [stocks, setStocks] = useState<Stocks>({});
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.data?.success) {
        setUser(data.data.user);
        setBalance(data.data.user.balance.INR);
        setStocks(data.data.user.balance.stocks);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        checkAuth,
        setUser,
        balance,
        setBalance,
        setStocks,
        stocks,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
