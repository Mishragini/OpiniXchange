'use client'

interface FormErrors {
    email?: string;
    password?: string;
}

import React, { useCallback, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from '../../_components/AuthProvider';

export const LoginDialog: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string>('');
    const { setUser, setBalance, setStocks } = useAuth()


    const validateEmail = (email: string): boolean => {
        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // const validatePassword = (password: string): boolean => {
    //     const hasMinLength: boolean = password.length >= 8;
    //     const hasUpperCase: boolean = /[A-Z]/.test(password);
    //     const hasLowerCase: boolean = /[a-z]/.test(password);
    //     const hasNumber: boolean = /\d/.test(password);
    //     const hasSpecialChar: boolean = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    //     return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    // };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }
        // } else if (!validatePassword(password)) {
        //     newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setServerError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            console.log(response);

            const result = await response.json()

            console.log(result);

            if (!result.data.success) {
                throw new Error(result.data.message || 'Login failed');
            }

            setUser(result.data.user);
            setBalance(result.data.user.balance.INR);
            setStocks(result.data.user.balance.stocks);
            setEmail('');
            setPassword('');
            setOpen(false);

        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, password]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-black text-white px-4 py-1 border-black border-2 text-base font-medium">
                    Login
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email">Email</Label>
                            <div className="col-span-3">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setEmail(e.target.value)}
                                    className={errors.email ? 'border-red-500' : ''}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                />
                                {errors.email && (
                                    <p id="email-error" className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password">Password</Label>
                            <div className="col-span-3 ">
                                <div className='relative'>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setPassword(e.target.value)}
                                        className={errors.password ? 'border-red-500' : ''}
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;