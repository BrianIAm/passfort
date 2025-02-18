'use client';

import { PasswordGenerator } from '#/components/PasswordGenerator';

export default function Page() {
    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Password Generator</h2>
                    <p className="text-red-500 mt-2">Generate strong and secure passwords</p>
                </div>
            </div>

            <PasswordGenerator />
        </main>
    );
}
