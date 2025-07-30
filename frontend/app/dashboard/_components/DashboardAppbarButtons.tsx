'use client';
import { useEffect, useState } from "react";
import { useAuth } from "../../_components/AuthProvider"
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import OnrampDialog from "./OnrampDailog";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "./WebsocketProvider";

export const DashboardAppbarButtons = () => {
    const router = useRouter();
    const { user, isLoading, setUser, balance, setBalance, setStocks } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isOnrampDialogOpen, setIsOnrampDialogOpen] = useState(false);
    const { toast } = useToast();
    const { disconnect } = useWebSocket();

    useEffect(() => {
        setMounted(true);
    }, []);



    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return null;
    }

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
                credentials: "include",
                method: "POST"
            })
            const result = await response.json();
            if (result.success) {
                setUser(null);
                setBalance({ available: 0, locked: 0 })
                setStocks({})
                disconnect()
                router.push(`/dashboard`);
            }
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: "Logout failed",
                description: error instanceof Error ? "error.message" : "Could not log you out.",
            });
        }

    }

    if (user) {
        return (
            <>
                <div className="flex items-center gap-6">
                    <div
                        className="px-3 py-1 border bg-white flex gap-4 items-center cursor-pointer"
                        onClick={() => setIsOnrampDialogOpen(true)}
                    >
                        <Image
                            src='/wallet.svg'
                            width={20}
                            height={20}
                            alt="wallet-icon"
                        />
                        <div>
                            ₹{(balance.available / 100).toFixed(2)}
                        </div>
                    </div>
                    <div onClick={handleLogout} className="flex items-center gap-4 cursor-pointer">
                        <Image
                            src='/logout.svg'
                            width={20}
                            height={30}
                            alt="logout-icon"
                        />
                        <div>Logout</div>
                    </div>
                    <button onClick={() => { router.push('/dashboard/portfolio') }} className="hidden md:block">
                        <Image
                            src='/user.svg'
                            width={35}
                            height={30}
                            alt="user-icon"
                        />
                    </button>

                </div>

                <OnrampDialog
                    open={isOnrampDialogOpen}
                    onOpenChange={setIsOnrampDialogOpen}
                />
            </>
        );
    }

    return (
        <div className="md:flex gap-6 items-center hidden">
            <LoginDialog />
            <SignupDialog />
        </div>
    );
};

export default DashboardAppbarButtons;

