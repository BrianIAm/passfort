'use client';
import React, { useState, useCallback, createContext } from 'react';

export interface Toast {
    content: string | React.ReactNode | React.ReactNode[];
    time: number;
    readonly createdAt: number;
}

type ToastProps = {
    toasts: Toast[];
    addToast: (toast: Toast) => void;
    removeToast: (toast: Toast) => void;
    removeToastByIndex: (index: number) => void;
};

export const ToastContext = createContext<ToastProps>({} as ToastProps);

export function ToastProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Toast) => {
        // Add a createdAt timestamp to the toast
        toast = { ...toast, createdAt: Date.now() };
        setToasts((prev) => [...prev, toast]);
    }, []);

    const removeToast = useCallback((toast: Toast) => {
        setToasts((prev) => prev.filter((t) => t !== toast));
    }, []);

    const removeToastByIndex = useCallback((index: number) => {
        setToasts((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return (
        <ToastContext.Provider
            value={{
                toasts,
                addToast,
                removeToast,
                removeToastByIndex,
            }}
        >
            {children}
        </ToastContext.Provider>
    );
}
