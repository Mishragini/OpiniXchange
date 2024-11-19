'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react"

interface Category {
    id: string,
    title: string,
    icon: string,
    description: string
}

export const mockCategories: Category[] = [
    {
        id: '1',
        title: 'Technology',
        icon: '💻',
        description: 'Latest tech news and gadgets'
    },
    {
        id: '2',
        title: 'Sports',
        icon: '⚽',
        description: 'Sports updates and highlights'
    },
    {
        id: '3',
        title: 'Food & Dining',
        icon: '🍽️',
        description: 'Restaurants and recipes'
    },
    {
        id: '4',
        title: 'Entertainment',
        icon: '🎬',
        description: 'Movies, TV shows, and music'
    },
    {
        id: '5',
        title: 'Travel',
        icon: '✈️',
        description: 'Travel guides and destinations'
    },
    {
        id: '6',
        title: 'Health',
        icon: '💪',
        description: 'Fitness and wellness tips'
    }
];

interface CategoryContextType {
    displayedCategories: Category[] | null,
    isLoading: boolean,
    activeCategory: string,
    setActiveCategory: Dispatch<SetStateAction<string>>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)
export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<Category[] | null>(null)
    const [activeCategory, setActiveCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/categories`, {
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const result = await response.json();
            if (result.data.categories.length > 0)
                setCategories(result.data.categories)
            setCategories(mockCategories);

        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories(mockCategories);
        } finally {
            setIsLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const displayedCategories = categories || mockCategories;
    return (
        <CategoryContext.Provider value={{ displayedCategories, isLoading, activeCategory, setActiveCategory }}>
            {children}
        </CategoryContext.Provider>
    )
}

export const useCategory = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategory must be used within an CategoryProvider');
    }
    return context;
}