'use client';
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

export const Appbar = () => {

    const router = useRouter()
    return (
        <div className="fixed top-0 left-0 right-0 bg-[#f5f5f5] z-50 px-10 lg:px-48">
            <div className=" border-b">
                <div className="flex justify-center md:justify-between items-center mx-2 py-2">
                    <Image
                        src='/logo.png'
                        width={100}
                        height={100}
                        alt="logo"
                        priority
                        className="cursor-pointer"
                        onClick={() => { router.push('/') }}
                    />

                    <button onClick={() => { router.push('/dashboard') }} className="bg-black text-white py-1 px-3 text-base font-medium hover:bg-white hover:text-black border-2 border-black hidden md:block">Trade Online</button>

                </div>

            </div>
        </div>
    )
}