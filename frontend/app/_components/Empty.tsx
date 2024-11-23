import Image from "next/image"

export const Empty = () => {
    return (
        <div className="flex justify-center items-center my-[20px]">
            <div>
                <Image
                    src='/empty.png'
                    width={300}
                    height={300}
                    alt="empty"
                />
                <div className="text-2xl font-bold mt-[20px] text-center">Nothing to show here... yet </div>
            </div>

        </div>
    )
}