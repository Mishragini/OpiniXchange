import React, { useState } from 'react';
import { useAuth } from "@/app/_components/AuthProvider";
import { useMarket } from "@/app/_components/MarketsProvider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdminMarkets = () => {
    const { user, setStocks } = useAuth();
    const { markets } = useMarket();
    const [selectedMarket, setSelectedMarket] = useState('');
    const [mintData, setMintData] = useState({
        quantity: '',
        price: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const AdminMarkets = markets?.filter(m => m.createdBy === user.id);

    const handleMint = async (symbol: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/mint`, {
                credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol,
                    quantity: Number(mintData.quantity),
                    price: Number(mintData.price)
                })
            });

            const data = await response.json()

            if (!data.data.success) {
                throw new Error('Mint failed');
            }
            setStocks(data.data.mintUser.balance.stocks)
            setMintData({ quantity: '', price: '' });
            setSelectedMarket('');
        } catch (error) {
            console.error('Error minting tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Markets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AdminMarkets?.map((market) => (
                    <Card key={market.id} className="w-full">
                        <CardHeader>
                            <CardTitle className="text-lg">{market.categoryTitle}</CardTitle>
                            <CardDescription>{market.symbol}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">Status: {market.status}</p>
                                <p className="text-sm">Last Yes Price: ₹{market.lastYesPrice}</p>
                                <p className="text-sm">Last No Price: ₹{market.lastNoPrice}</p>
                                <p className="text-sm">Volume: {market.totalVolume}</p>

                                <Dialog open={selectedMarket === market.id}
                                    onOpenChange={(open) => {
                                        if (!open) setSelectedMarket('');
                                        else setSelectedMarket(market.id);
                                    }}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full mt-2">Mint Tokens</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Mint Tokens for {market.symbol}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    value={mintData.quantity}
                                                    onChange={(e) => setMintData(prev => ({
                                                        ...prev,
                                                        quantity: e.target.value
                                                    }))}
                                                    placeholder="Enter quantity"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="price">Price</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={mintData.price}
                                                    onChange={(e) => setMintData(prev => ({
                                                        ...prev,
                                                        price: e.target.value
                                                    }))}
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleMint(market.symbol)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Minting...' : 'Mint'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminMarkets;