'use client';
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import DashboardAppbarButtons from "./DashboardAppbarButtons";
import { Category } from "./Categories";

export const DashboardAppbar = () => {
    const pathname = usePathname()
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
                    <DashboardAppbarButtons />
                </div>
                {pathname === '/dashboard' && <Category />}

            </div>
        </div>
    )
}