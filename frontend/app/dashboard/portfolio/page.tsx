'use client';
import React, { useState } from 'react';
import { AuthContextType, useAuth } from "../../_components/AuthProvider";
import { useCategory } from "../../_components/CategoryProvider";
import { PlusCircle, Wallet, TrendingUp} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import AdminMarkets from './_components/AdminMarkets';
import { Empty } from '../../_components/Empty';
import { useMarket } from '../../_components/MarketsProvider';

export type Role = 'ADMIN' | 'USER';

export interface Balance {
    available: number;
    locked: number;
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

export interface UserBalance {
    INR: Balance;
    stocks: Stocks;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    balance: UserBalance;
}


export interface MarketDetails {
    symbol: string;
    description: string;
    endTime: string;
    sourceOfTruth: string;
    categoryTitle: string;
}

export interface CategoryDetails {
    title: string;
    icon: string;
    description: string;
}

const Portfolio: React.FC = () => {
    const { user, isLoading, balance, stocks } = useAuth() as AuthContextType;
    const { categories, addCategory } = useCategory();
    const { setMarkets } = useMarket()
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);
    const [marketDetails, setMarketDetails] = useState<MarketDetails>({
        symbol: '',
        description: '',
        endTime: '',
        sourceOfTruth: '',
        categoryTitle: ''
    });

    const [newCategory, setNewCategory] = useState<CategoryDetails>({
        title: '',
        icon: '',
        description: ''
    });

    const isAdmin = user?.role === 'ADMIN';



    const formatINR = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount / 100);
    };

    const createCategory = async () => {
        try {
            const success = await addCategory(newCategory);

            if (success) {
                setMarketDetails(prev => ({
                    ...prev,
                    categoryTitle: newCategory.title
                }));

                toast({
                    title: "Success",
                    description: "Category created successfully",
                });

                setNewCategory({ title: '', icon: '', description: '' });
                setShowCategoryForm(false);
            } else {
                throw new Error('Failed to create category');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create category",
                variant: "destructive"
            });
        }
    };
    const createMarket = async () => {
        try {
            setIsCreating(true);

            const payload = {
                ...marketDetails,
                endTime: new Date(marketDetails.endTime).toISOString()
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/create/market`, {
                credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data.data);

            if (!data.data.success) {
                throw new Error(data.message || 'Failed to create market');
            }
            setMarkets((prev) => [...prev, data.data.market])
            toast({
                title: "Success",
                description: "Market created successfully",
            });

            setMarketDetails({
                symbol: '',
                description: '',
                endTime: '',
                sourceOfTruth: '',
                categoryTitle: ''
            });

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create market",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-[100px] min-h-screen">
            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5" />
                                Available Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatINR(balance.available)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Locked Amount
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatINR(balance.locked || 0)}
                            </p>
                        </CardContent>
                    </Card>


                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Symbol</th>
                                        <th className="text-left p-4">Type</th>
                                        <th className="text-right p-4">Quantity</th>
                                        <th className="text-right p-4">Locked</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Object.entries(stocks || {}).map(([symbol, types]) =>
                                        Object.entries(types).map(([type, details]) => (
                                            <tr key={`${symbol}-${type}`} className="border-b">
                                                <td className="p-4">{symbol}</td>
                                                <td className="p-4">{type}</td>
                                                <td className="text-right p-4">{details.quantity}</td>
                                                <td className="text-right p-4">{details.locked}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {Object.keys(user?.balance?.stocks || {}).length === 0 && <Empty />}
                        </div>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full md:w-auto">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Create Market
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Market</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Market Symbol"
                                        value={marketDetails.symbol}
                                        onChange={(e) =>
                                            setMarketDetails(prev => ({
                                                ...prev,
                                                symbol: e.target.value
                                            }))
                                        }
                                    />

                                    {!showCategoryForm ? (
                                        <div className="space-y-4">
                                            <Select
                                                value={marketDetails.categoryTitle}
                                                onValueChange={(value) => {
                                                    if (value === 'new') {
                                                        setShowCategoryForm(true);
                                                    } else {
                                                        setMarketDetails(prev => ({
                                                            ...prev,
                                                            categoryTitle: value
                                                        }));
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories?.map((category) => (
                                                        <SelectItem key={category.title} value={category.title}>
                                                            {category.title}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="new">+ Create New Category</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Input
                                                placeholder="Category Title"
                                                value={newCategory.title}
                                                onChange={(e) =>
                                                    setNewCategory(prev => ({
                                                        ...prev,
                                                        title: e.target.value
                                                    }))
                                                }
                                            />
                                            <Input
                                                placeholder="Category Icon"
                                                value={newCategory.icon}
                                                onChange={(e) =>
                                                    setNewCategory(prev => ({
                                                        ...prev,
                                                        icon: e.target.value
                                                    }))
                                                }
                                            />
                                            <Input
                                                placeholder="Category Description"
                                                value={newCategory.description}
                                                onChange={(e) =>
                                                    setNewCategory(prev => ({
                                                        ...prev,
                                                        description: e.target.value
                                                    }))
                                                }
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1"
                                                    onClick={createCategory}
                                                >
                                                    Create Category
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setShowCategoryForm(false);
                                                        setNewCategory({ title: '', icon: '', description: '' });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Input
                                        placeholder="Market Description"
                                        value={marketDetails.description}
                                        onChange={(e) =>
                                            setMarketDetails(prev => ({
                                                ...prev,
                                                description: e.target.value
                                            }))
                                        }
                                    />

                                    <Input
                                        type="datetime-local"
                                        placeholder="End Time"
                                        value={marketDetails.endTime}
                                        onChange={(e) =>
                                            setMarketDetails(prev => ({
                                                ...prev,
                                                endTime: e.target.value
                                            }))
                                        }
                                    />

                                    <Input
                                        placeholder="Source of Truth"
                                        value={marketDetails.sourceOfTruth}
                                        onChange={(e) =>
                                            setMarketDetails(prev => ({
                                                ...prev,
                                                sourceOfTruth: e.target.value
                                            }))
                                        }
                                    />

                                    <Button
                                        className="w-full"
                                        onClick={createMarket}
                                        disabled={isCreating || showCategoryForm}
                                    >
                                        {isCreating ? 'Creating...' : 'Create Market'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <AdminMarkets />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;