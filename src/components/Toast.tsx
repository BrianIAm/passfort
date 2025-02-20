'use client';
import type { Toast } from '#/context/ToastContext';

export function Toast() {
    return (
        <div className="relative bg-passfort-500-500/10 border border-passfort-500-500 text-white p-3 rounded-xl backdrop:bg-black/50 backdrop:backdrop-blur-xs">
            <h1>Toast</h1>
        </div>
    );
}
