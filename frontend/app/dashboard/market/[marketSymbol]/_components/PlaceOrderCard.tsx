import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { useOrders } from "./OrdersProvider";

const PlaceOrderCard = ({ lastYesPrice, lastNoPrice, marketSymbol }: { lastYesPrice: number, lastNoPrice: number, marketSymbol: string }) => {
    const [selectedOption, setSelectedOption] = useState<"YES" | "NO">("YES");
    const [selectedOrderType, setSelectedOrderType] = useState<"BUY" | "SELL">("BUY");
    const [price, setPrice] = useState(lastYesPrice);
    const [quantity, setQuantity] = useState(1);
    const { toast } = useToast();
    const { setAllBuyOrders, setAllSellOrders } = useOrders()

    const handleOptionChange = (option: "YES" | "NO") => {
        setSelectedOption(option);
        setPrice(option === "YES" ? lastYesPrice : lastNoPrice);
    };

    const handleQuantityChange = (type: "increment" | "decrement") => {
        setQuantity((prev) => (type === "increment" ? prev + 1 : Math.max(1, prev - 1)));
    };

    const handlePriceChange = (type: "increment" | "decrement") => {
        setPrice((prev) => (type === "increment" ? prev + 0.5 : Math.max(0, prev - 0.5)));
    };

    const handlePlaceOrder = useCallback(async () => {
        console.log(marketSymbol)
        try {
            const endpoint = selectedOrderType === "BUY" ? "/user/buy" : "/user/sell";
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol: marketSymbol, quantity, price, stockType: selectedOption }),
            });

            const result = await response.json();
            if (result.data.success) {
                toast({
                    variant: "default",
                    title: `${selectedOrderType} Order`,
                    description: result.data.message,
                });
                console.log(result.data);
                if (result.data.buyOrder) {
                    setAllBuyOrders((prev) => prev ? [...prev, result.data.buyOrder] : [result.data.buyOrder]);
                }

                // When updating sell orders
                if (result.data.sellOrder) {
                    setAllSellOrders((prev) => prev ? [...prev, result.data.sellOrder] : [result.data.sellOrder]);
                }
                // fetchOrders();
                return;
            }
            toast({
                variant: "destructive",
                title: "Could not place order.",
                description: result.data.message,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Could not place order.",
                description: "There was a problem with your request.",
            });
        }
    }, [marketSymbol, quantity, price, selectedOption, selectedOrderType]);

    return (
        <div className="w-full border rounded-lg shadow-md p-4 bg-white">
            <div className="mb-4">
                <label htmlFor="orderType" className="block font-medium mb-2">
                    Select Order Type
                </label>
                <select
                    id="orderType"
                    value={selectedOrderType}
                    onChange={(e) => setSelectedOrderType(e.target.value as "BUY" | "SELL")}
                    className="w-full px-3 py-2 border rounded-md bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                </select>
            </div>

            <div className="flex justify-between mb-4">
                <button
                    onClick={() => handleOptionChange("YES")}
                    className={`flex-1 py-2 mx-1 rounded-md ${selectedOption === "YES" ? "bg-blue-600 text-white" : "bg-[#f5f5f5]"
                        }`}
                >
                    YES ₹{lastYesPrice}
                </button>
                <button
                    onClick={() => handleOptionChange("NO")}
                    className={`flex-1 py-2 mx-1 rounded-md ${selectedOption === "NO" ? "bg-red-600 text-white" : "bg-[#f5f5f5]"
                        }`}
                >
                    NO ₹{lastNoPrice}
                </button>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Price</label>
                    <div className="flex items-center">
                        <button
                            onClick={() => handlePriceChange("decrement")}
                            className="px-2 py-1 bg-gray-200 rounded-l-md"
                        >
                            -
                        </button>
                        <div className="px-4 py-1 border-y border-gray-300">{`₹${price.toFixed(1)}`}</div>
                        <button
                            onClick={() => handlePriceChange("increment")}
                            className="px-2 py-1 bg-gray-200 rounded-r-md"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Quantity</label>
                    <div className="flex items-center">
                        <button
                            onClick={() => handleQuantityChange("decrement")}
                            className="px-2 py-1 bg-gray-200 rounded-l-md"
                        >
                            -
                        </button>
                        <div className="px-4 py-1 border-y border-gray-300">{quantity}</div>
                        <button
                            onClick={() => handleQuantityChange("increment")}
                            className="px-2 py-1 bg-gray-200 rounded-r-md"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-700">You put</p>
                    <p className="font-bold">{`₹${(price * quantity).toFixed(1)}`}</p>
                </div>
                <div>
                    <p className="text-gray-700">You get</p>
                    <p className="font-bold text-green-600">₹10.0</p>
                </div>
            </div>

            <button
                onClick={handlePlaceOrder}
                className={`${selectedOption === "YES" ? "bg-blue-600" : "bg-red-600"} text-white py-2 rounded-md w-full`}
            >
                Place {selectedOrderType} Order
            </button>
        </div>
    );
};

export default PlaceOrderCard;
