'use client';

import { getCurrentWindow } from '@tauri-apps/api/window';

export default function Component() {
    const handleMouseDown = (e: React.MouseEvent) => {
        const appWindow = getCurrentWindow();

        if (e.buttons === 1) {
            e.detail === 2 ? appWindow.toggleMaximize() : appWindow.startDragging();
        }
    };

    return (
        <div
            className="absolute bg-zinc-800 w-min right-0 flex justify-between items-center h-8 "
            onMouseDown={handleMouseDown}
        >
            <button id="minimize">-</button>
            <button id="maximize">+</button>
            <button id="close">x</button>
        </div>
    );
}
