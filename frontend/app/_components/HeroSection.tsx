import Image from "next/image"

export const HeroSection = () => {
    return (
        <div className=" px-10 lg:px-48 min-h-[500px] w-full flex justify-between items-center pt-[100px]">
            <div className="flex flex-col items-center md:items-start gap-y-4 md:w-1/2">
                <div className="text-5xl lg:text-7xl font-normal">Invest in your</div>
                <div className="text-3xl lg:text-5xl font-normal">point of view</div>
                <div className="text-lg lmd:text-xl g:text-3xl font-normal text-gray-500">Sports, Entertainment, Economy or Finance.</div>
                <button className="bg-black text-white px-4 py-2 my-2 md:text-xl font-semibold hover:bg-white hover:text-black border-2 border-black">Trade Online</button>
            </div>
            <div className="relative w-1/2 h-[500px] lg:h-[600px] hidden md:block">
                <Image
                    src='/hero.png'
                    fill={true}
                    alt="hero-section-image"
                    objectFit="contain"
                />
            </div>
        </div>
    )
}