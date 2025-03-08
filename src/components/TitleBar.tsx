'use client';
import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { MinimizeIcon, ExpandIcon, MinusIcon, CloseIcon } from '#/icons';

export default function Component() {
    const [isMaximized, setMaximized] = useState(false);

    const handleMinimize = async () => {
        const appWindow = getCurrentWindow();
        appWindow.minimize();
    };

    const handleToggleMaximized = async () => {
        const appWindow = getCurrentWindow();
        appWindow.toggleMaximize();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const appWindow = getCurrentWindow();

        if (e.buttons === 1) {
            e.detail === 2 ? appWindow.toggleMaximize() : appWindow.startDragging();
        }
    };

    useEffect(() => {
        const checkMaximized = async () => {
            setMaximized(await getCurrentWindow().isMaximized());
        };

        checkMaximized();
    }, []);

    return (
        <div
            data-tauri-drag-region
            className="absolute h-10 flex justify-end w-screen items-center gap-4 text-passfort-500 px-4"
            onMouseDown={handleMouseDown}
        >
            <button
                id="titlebar-minimize"
                className="p-1 hover:text-white hover:bg-red-900/50 rounded-lg hover:transition-all"
                onClick={handleMinimize}
            >
                <MinusIcon />
            </button>
            <button
                id="titlebar-maximize"
                className="p-1 hover:text-white hover:bg-red-900/50 rounded-lg hover:transition-all"
                onClick={handleToggleMaximized}
            >
                {isMaximized ? <MinimizeIcon /> : <ExpandIcon />}
            </button>
            <button
                id="titlebar-close"
                className="p-1 hover:text-white hover:bg-red-900/50 rounded-lg hover:transition-all"
            >
                <CloseIcon />
            </button>

            {/* <div className="titlebar-button" id="titlebar-minimize">
                <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
            </div>
            <div className="titlebar-button" id="titlebar-maximize">
                <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
            </div>
            <div className="titlebar-button" id="titlebar-close">
                <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
            </div> */}
        </div>
    );
}
