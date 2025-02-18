'use client';
import { useState } from 'react';
import { Dialog } from '#/components/Dialog';
import { deleteAllData } from '#/lib/fs';
import { ExclamationIcon } from '#/icons';

export default function Page() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteData = async () => {
        try {
            await deleteAllData();
        } catch (error) {
            // console.error("Failed to delete data:", error);
        } finally {
            setShowDeleteModal(false);
            window.location.assign('/'); // Redirect to home after deletion
        }
    };

    return (
        <main className="w-full">
            <div className="flex-1 px-8 py-4 max-w-7xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold">Settings</h2>
                        <p className="text-red-500 mt-2">Configure PassFort to your liking</p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h3>
                    <div className="p-6 border-2 border-red-500 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-medium text-white">Delete All Data</h4>
                                <p className="text-sm text-red-500">
                                    Permanently delete all your stored passwords and settings. This
                                    action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                            >
                                Delete All Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <Dialog onClose={() => setShowDeleteModal(false)}>
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <ExclamationIcon className="w-8 h-8 text-red-500 mr-2" />
                                <h3 className="text-3xl font-bold text-white">Delete All Data</h3>
                            </div>

                            <div className="mb-6">
                                <p className="text-passfort-vibrant mb-4">
                                    This will permanently delete:
                                </p>
                                <ul className="list-disc list-inside text-passfort-vibrant space-y-2">
                                    <li>All stored passwords</li>
                                    <li>Your master password verification</li>
                                    <li>All settings and preferences</li>
                                </ul>
                            </div>

                            <div className="bg-red-500/10 p-4 rounded-lg mb-6">
                                <p className="text-red-400 text-sm">
                                    This action is permanent and cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 rounded-lg border border-passfort-vibrant text-passfort-vibrant hover:bg-passfort-vibrant/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteData}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete Everything
                                </button>
                            </div>
                        </div>
                    </Dialog>
                )}
            </div>
        </main>
    );
}
