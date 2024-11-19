'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react"
interface User {
    INR: { available: number, locked: number }
    stocks: any,
    email: string,
    id: string,
    password: string,
    role: string,
    username: string
}
interface AuthContextType {
    user: any;
    isLoading: boolean;
    setUser: Dispatch<SetStateAction<User | null>>
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
                credentials: 'include',
            });

            const data = await response.json();

            if (data.data?.success) {
                setUser(data.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
            setMounted(true);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, checkAuth, setUser }}>
            {children}
        </AuthContext.Provider>
    );


}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};