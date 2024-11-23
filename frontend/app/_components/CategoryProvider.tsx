'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react"

export interface Category {
    id: string;
    title: string;
    icon: string;
    description: string;
}



interface CategoryContextType {
    categories: Category[];
    isLoading: boolean;
    activeCategory: string;
    setActiveCategory: Dispatch<SetStateAction<string>>;
    addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
    refreshCategories: () => Promise<void>;
    error: string | null;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/categories`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const result = await response.json();
            if (result.data.categories.length > 0) {
                setCategories(result.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addCategory = async (newCategory: Omit<Category, 'id'>): Promise<boolean> => {
        try {
            setError(null);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/create/category`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create category');
            }

            const result = await response.json();

            const createdCategory = result.data.category;

            setCategories(prev => [...prev, createdCategory]);

            return true;
        } catch (error) {
            console.error('Error creating category:', error);
            setError(error instanceof Error ? error.message : 'Failed to create category');
            return false;
        }
    };

    const refreshCategories = async () => {
        await fetchCategories();
    };

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    return (
        <CategoryContext.Provider
            value={{
                categories,
                isLoading,
                activeCategory,
                setActiveCategory,
                addCategory,
                refreshCategories,
                error
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategory must be used within a CategoryProvider');
    }
    return context;
};