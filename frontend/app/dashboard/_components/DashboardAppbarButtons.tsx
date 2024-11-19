'use client';
import { useEffect, useState } from "react";
import { useAuth } from "../../_components/AuthProvider"
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";

export const DashboardAppbarButtons = () => {
    const { user, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return null;
    }
    if (user) {
        console.log(user)
        return (
            <button onClick={() => { redirect('/portfolio') }} className="text-lg font-semibold hidden md:block">
                <Image
                    src='/user.svg'
                    width={40}
                    height={40}
                    alt="user-icon"
                />
            </button>
        )
    }
    return (
        <div className="md:flex gap-6 items-center hidden ">
            <LoginDialog />
            <SignupDialog />
        </div>
    )
}