'use client';

import { platform, type Platform } from '@tauri-apps/plugin-os';
import { useState, useEffect, createContext, useContext } from 'react';

export const PlatformContext = createContext<Platform>('windows');

export function usePlatform() {
    return useContext(PlatformContext);
}

export function PlatformProvider({ children }: { children: React.ReactNode | React.ReactNode[] }) {
    const [currentPlatform, setCurrentPlatform] = useState<Platform>('windows');

    useEffect(() => {
        const checkPlatform = async () => {
            try {
                const currentPlatform = await platform();
                setCurrentPlatform(currentPlatform);
            } catch (_) {}
        };

        checkPlatform();
    }, []);

    return <PlatformContext.Provider value={currentPlatform}>{children}</PlatformContext.Provider>;
}
