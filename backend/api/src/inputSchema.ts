import { z } from 'zod';

export const SignupSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['ADMIN', 'USER']),
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const OrderSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    quantity: z.number().gt(0, "Quantity must be greater than 0"),
    price: z.number().gt(0, "Price must be greater than 0"),
    stockType: z.enum(['YES', 'NO']),
});

export const CategorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    icon: z.string().min(1, "Icon is required"),
    description: z.string().min(1, "Description is required"),
});

export const MarketSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    description: z.string().min(1, "Description is required"),
    endTime: z.string()
        .datetime() 
        .transform((str) => new Date(str)),

    sourceOfTruth: z.string().min(1, "Source of truth is required"),
    categoryTitle: z.string().min(1, "Category title is required"),
});


export const MintSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    quantity: z.number().gt(0, "Quantity must be greater than 0"),
    price: z.number().gt(0, "Price must be greater than 0"),
});
