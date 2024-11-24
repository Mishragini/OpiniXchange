import { format } from "date-fns";
import { Side } from "./OrdersProvider";

interface Trade {
    buyer: string;
    seller: string;
    price: number;
    quantity: number;
    marketSymbol: string;
    timestamp: string;
    side: Side
}

interface TradesCardProps {
    trades: Trade[];
}

export const TradesCard = ({ trades }: TradesCardProps) => {
    return (
        <div className="w-full">
            <div className="overflow-hidden">
                <div className="grid grid-cols-6 gap-4 mb-2 text-sm font-medium">
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Side</div>
                    <div>Buyer</div>
                    <div>Seller</div>
                    <div>Time</div>
                </div>
                <div className="space-y-1">
                    {trades.length > 0 ? (
                        trades.map((trade, index) => (
                            <div
                                key={`${trade.timestamp}-${index}`}
                                className="grid grid-cols-6 gap-4 text-sm hover:bg-gray-50"
                            >
                                <div className={trade.side === 'YES' ? 'text-green-600' : 'text-red-600'}>
                                    ₹{(trade.price).toFixed(2)}
                                </div>
                                <div>{trade.quantity}</div>
                                <div>{trade.side}</div>
                                <div>
                                    {trade.buyer}
                                </div>
                                <div>
                                    {trade.seller}
                                </div>
                                <div>
                                    {format(new Date(trade.timestamp), 'HH:mm:ss')}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">No trades yet</div>
                    )}
                </div>
            </div>
        </div>
    );
};