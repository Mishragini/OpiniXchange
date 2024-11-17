import Image from "next/image"

export const Return = () => {
    return (
        <div className="hidden md:block px-4 sm:px-6 lg:px-48 pt-12 md:pt-24 text-center bg-black">
            <div className="md:text-5xl lg:text-7xl text-white">What will be the return</div>
            <div className="md:text-5xl lg:text-7xl text-white">on your opinions?</div>
            <div className="flex justify-between">
                <Image
                    src="/punjabi.png"
                    width={300}
                    height={300}
                    alt="punjabi"
                />
                <Image
                    src="/uncle.png"
                    width={300}
                    height={300}
                    alt="uncle"
                />
            </div>
        </div>
    )
}