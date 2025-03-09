'use client';
import { useState, useEffect, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { MinusIcon, CloseIcon, WindowsMaximizeIcon, WindowsRestoreIcon } from '#/icons';

// Platform-specific title bar configurations
const TITLE_BAR_CONFIGS = {
    windows: {
        className:
            'absolute h-10 flex justify-end w-screen items-center gap-4 text-passfort-500 px-4',
        buttonClass: 'p-1 hover:text-white hover:bg-red-900/50 rounded-lg hover:transition-all',
    },
    macos: {
        className: 'absolute w-screen h-12 flex items-center gap-2 px-5',
        buttons: [
            { color: 'bg-red-500 hover:bg-red-700', action: 'close', label: 'Close' },
            { color: 'bg-yellow-500 hover:bg-yellow-700', action: 'minimize', label: 'Minimize' },
            {
                color: 'bg-green-500 hover:bg-green-700',
                action: 'maximize',
                label: 'Toggle maximize',
            },
        ],
    },
};

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);
    const [platform] = useState('windows'); // Default to Windows, could detect OS

    // Window action handlers
    const windowActions: Record<string, () => Promise<void>> = {
        close: () => getCurrentWindow().close(),
        minimize: () => getCurrentWindow().minimize(),
        maximize: useCallback(async () => {
            const window = getCurrentWindow();
            await window.toggleMaximize();
            setIsMaximized(await window.isMaximized());
        }, []),
    };

    // Check initial window state
    useEffect(() => {
        const checkWindowState = async () => {
            try {
                setIsMaximized(await getCurrentWindow().isMaximized());
            } catch (error) {
                console.error('Failed to check window state:', error);
            }
        };

        checkWindowState();
    }, []);

    // Render macOS title bar
    if (platform === 'macos') {
        const { className, buttons } = TITLE_BAR_CONFIGS.macos;

        return (
            <div data-tauri-drag-region className={className}>
                {buttons.map((btn, index) => (
                    <button
                        key={index}
                        onClick={windowActions[btn.action]}
                        className={`h-3 w-3 rounded-full ${btn.color}`}
                        aria-label={btn.label}
                    />
                ))}
            </div>
        );
    }

    // Render Windows/Linux title bar
    const { className, buttonClass } = TITLE_BAR_CONFIGS.windows;

    return (
        <div data-tauri-drag-region className={className}>
            <button id="titlebar-minimize" className={buttonClass} onClick={windowActions.minimize}>
                <MinusIcon />
            </button>
            <button id="titlebar-maximize" className={buttonClass} onClick={windowActions.maximize}>
                {isMaximized ? <WindowsRestoreIcon /> : <WindowsMaximizeIcon />}
            </button>
            <button id="titlebar-close" className={buttonClass} onClick={windowActions.close}>
                <CloseIcon />
            </button>
        </div>
    );
}
