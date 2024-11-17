import Image from "next/image"

export const MarketCard = ({ title, description }: { title: string, description: string }) => {
    return (
        <div className="bg-white p-4 mb-2 min-w-[320px] lg:min-w-full rounded-lg shadow-sm">
            <Image
                src="https://probo.in/_next/image?url=https%3A%2F%2Fgumlet-images-bucket.s3.ap-south-1.amazonaws.com%2Fprobo_product_images%2FIMAGE_f19f81af-fdf7-47da-b360-c990246b148f.png&w=64&q=75"
                height={100}
                width={100}
                alt="market-icon"
            />
            <div className="font-medium mt-2">{title}</div>
            <div className="text-gray-600 mt-1 text-sm">{description}</div>
            <div className="flex gap-x-4 mt-4">
                <button className="bg-blue-100 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors">Yes $2</button>
                <button className="bg-red-100 px-4 py-2 rounded-md hover:bg-red-200 transition-colors">No $2</button>
            </div>
        </div>
    )
}