"use client";
import type { Toast } from "#/context/ToastContext";

export default function Toast() {
    return (
        <div className="relative bg-passfort-vibrant/10 border border-passfort-vibrant text-white p-3 rounded-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm">
            <h1>Toast</h1>
        </div>
    );
}
