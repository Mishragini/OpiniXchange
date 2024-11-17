import Image from "next/image"

export const Appbar = () => {
    return (
        <div className="fixed top-0 left-0 right-0 bg-[#f5f5f5] z-50 px-10 lg:px-48">
            <div className="py-4 border-b">
                <div className="flex justify-center md:justify-between items-center mx-2">
                    <Image
                        src='/logo.png'
                        width={120}
                        height={120}
                        alt="logo"
                    />
                    <button className="bg-black text-white p-2 text-lg font-medium hover:bg-white hover:text-black border-2 border-black hidden md:block">Trade Online</button>
                </div>
            </div>
        </div>
    )
}