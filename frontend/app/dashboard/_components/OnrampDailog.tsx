'use client';

import React, { useCallback, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/app/_components/AuthProvider';

interface OnrampDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface FormErrors {
    amount?: string;
}

export const OnrampDialog: React.FC<OnrampDialogProps> = ({ open, onOpenChange }) => {
    const { setBalance } = useAuth()
    const [amount, setAmount] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string>('');

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!amount) {
            newErrors.amount = 'Amount is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOnramp = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setServerError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/onramp/inr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: parseFloat(amount) }),
                credentials: 'include',
            });

            const result = await response.json();

            if (!result.data.success) {
                throw new Error(result.data.message || 'Onramp failed');
            }

            const newBalance = result.data.user.balance.INR;
            setBalance(newBalance);
            setAmount('');
            onOpenChange(false);

        } catch (error) {
            if (error instanceof Error) {
                setServerError(error.message);
            } else {
                setServerError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    }, [amount, onOpenChange, setBalance]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Onramp INR</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOnramp} className="space-y-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="col-span-3">
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setAmount(e.target.value)
                                    }
                                    className={errors.amount ? 'border-red-500' : ''}
                                    aria-invalid={Boolean(errors.amount)}
                                    aria-describedby={errors.amount ? "amount-error" : undefined}
                                />
                                {errors.amount && (
                                    <p id="amount-error" className="text-red-500 text-sm mt-1">
                                        {errors.amount}
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
                            {isLoading ? 'Onramping...' : 'Onramp'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default OnrampDialog;
