'use client'

import { useState } from "react"
import { useCategory } from "../../_components/CategoryProvider";


export const Category = () => {
    const { isLoading, categories, setActiveCategory, activeCategory } = useCategory()

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
            <div
                onClick={() => setActiveCategory('')}
                className={`px-4 pt-2 hover:bg-gray-200 whitespace-nowrap flex items-center gap-2
                        ${activeCategory === ''
                        ? "text-black pb-1 border-b-2 border-black"
                        : "text-gray-700"
                    } cursor-pointer`}
            >
                <span>All Events</span>
            </div>
            {categories?.map((category, index) => (
                <div
                    key={category.id}
                    onClick={() => setActiveCategory(category.title)}
                    className={`px-4 pt-2 hover:bg-gray-200 whitespace-nowrap flex items-center gap-2
                        ${activeCategory === category.title
                            ? "text-black pb-1 border-b-2 border-black"
                            : "text-gray-700"
                        } cursor-pointer`}
                >
                    <span>{category.title}</span>
                </div>
            ))}
        </div>
    )
}