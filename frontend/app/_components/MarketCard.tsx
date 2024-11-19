import Image from "next/image"
import { Market } from "./MarketsProvider"

export const MarketCard = ({ market }: { market: Market }) => {
    return (
        <div className="bg-white p-4 mb-2 min-w-[320px] lg:min-w-full rounded-lg shadow-sm border border-black hover:bg-[#f5f5f5]">
            <div className="flex">
                <Image
                    src="/Bar_Chart.png"
                    width={20}
                    height={20}
                    alt="bar-chart"
                />
                <div className="text-sm text gray-700">{market.totalVolume} traders</div>
            </div>
            <Image
                src="https://probo.in/_next/image?url=https%3A%2F%2Fgumlet-images-bucket.s3.ap-south-1.amazonaws.com%2Fprobo_product_images%2FIMAGE_f19f81af-fdf7-47da-b360-c990246b148f.png&w=64&q=75"
                height={100}
                width={100}
                alt="market-icon"
            />
            <div className="font-medium mt-2">{market.symbol}</div>
            <div className="text-gray-600 mt-1 text-sm">{market.description}</div>
            <div className="flex gap-x-4 mt-4">
                <button className="bg-blue-100 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors">Yes ${market.lastYesPrice}</button>
                <button className="bg-red-100 px-4 py-2 rounded-md hover:bg-red-200 transition-colors">No ${market.lastNoPrice}</button>
            </div>
        </div>
    )
}