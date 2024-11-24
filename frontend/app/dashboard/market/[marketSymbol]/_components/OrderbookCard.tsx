interface OrderbookEntry {
    quantity: number;
}

interface Orderbook {
    [price: string]: OrderbookEntry;
}
interface OrderbookCardProps {
    yesOrderbook: Orderbook;
    noOrderbook: Orderbook;
}

export const OrderbookCard = ({ yesOrderbook, noOrderbook }: OrderbookCardProps) => {
    const sortedYesEntries = Object.entries(yesOrderbook)
        .map(([price, data]) => ({
            price: parseFloat(price),
            quantity: data.quantity
        }))
        .sort((a, b) => b.price - a.price);

    const sortedNoEntries = Object.entries(noOrderbook)
        .map(([price, data]) => ({
            price: parseFloat(price),
            quantity: data.quantity
        }))
        .sort((a, b) => b.price - a.price);

    const maxYesQuantity = Math.max(...sortedYesEntries.map(entry => entry.quantity), 0);
    const maxNoQuantity = Math.max(...sortedNoEntries.map(entry => entry.quantity), 0);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <div className="grid grid-cols-2 mb-2">
                    <div className="text-sm font-medium">PRICE</div>
                    <div className="text-sm font-medium text-right">QTY AT YES</div>
                </div>
                {sortedYesEntries.length > 0 ? (
                    sortedYesEntries.map((entry, index) => (
                        <div key={`yes-${index}`} className="grid grid-cols-2 relative">
                            <div className="z-10">{(entry.price / 100).toFixed(2)}</div>
                            <div className="text-right z-10">{entry.quantity}</div>
                            <div
                                className="absolute inset-0 bg-blue-100 opacity-50"
                                style={{
                                    width: `${(entry.quantity / maxYesQuantity) * 100}%`,
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-2">No YES orders</div>
                )}
            </div>
            <div>
                <div className="grid grid-cols-2 mb-2">
                    <div className="text-sm font-medium">PRICE</div>
                    <div className="text-sm font-medium text-right">QTY AT NO</div>
                </div>
                {sortedNoEntries.length > 0 ? (
                    sortedNoEntries.map((entry, index) => (
                        <div key={`no-${index}`} className="grid grid-cols-2 relative">
                            <div className="z-10">{(entry.price / 100).toFixed(2)}</div>
                            <div className="text-right z-10">{entry.quantity}</div>
                            <div
                                className="absolute inset-0 bg-red-100 opacity-50"
                                style={{
                                    width: `${(entry.quantity / maxNoQuantity) * 100}%`,
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-2">No NO orders</div>
                )}
            </div>
        </div>
    );
};