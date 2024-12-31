"use client";
import React, { useEffect, useState } from "react";
import { encrypt, decrypt } from "#/lib/encrypt";
import { Dialog } from "#/components/Dialog";
import { PasswordGenerator } from "#/components/PasswordGenerator";
import { writeText as writeTextToClipboard } from "@tauri-apps/plugin-clipboard-manager";
import {
    getStoredPasswords,
    setStoredPasswords,
    hasMasterPasswordVerification,
    saveMasterPasswordVerification,
} from "#/lib/fs";
import { ShieldIcon, CopyIcon, ExclamationIcon } from "#/icons";

export default function Page() {
    const [showUpdatePasswordDialog, setUpdatePasswordDialog] = useState(false);
    const [hasMasterPassword, setHasMasterPassword] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");

    // Check if the user has set a master password before
    useEffect(() => {
        hasMasterPasswordVerification().then((hasMasterPassword) => {
            setHasMasterPassword(hasMasterPassword);
        });
    }, []);

    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Master Password</h2>
                    <p className="text-passfort-vibrant mt-2">
                        Generate and manage your master password
                    </p>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-6 rounded-lg border border-red-500 bg-red-500/10 mb-8">
                <div className="flex items-center mb-4">
                    <ShieldIcon className="w-6 h-6 text-red-400 mr-2" />
                    <h3 className="text-xl font-bold text-red-400">Important Security Notice</h3>
                </div>
                <div className="space-y-4 text-red-400">
                    <p>
                        Your master password is the key to all your stored passwords. Make sure to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Choose a strong, unique password</li>
                        <li>Store it securely offline</li>
                        <li>Never share it with anyone</li>
                        <li>Consider changing it periodically</li>
                    </ul>
                    <p className="font-bold">
                        Warning: If you forget your master password, there is no way to recover your
                        stored passwords. Such is the price of security.
                    </p>
                </div>
            </div>

            {/* Password Generator */}
            <PasswordGenerator
                onGenerate={(password) => setGeneratedPassword(password)}
                onSave={() => setUpdatePasswordDialog(true)}
            />

            {showUpdatePasswordDialog && (
                <UpdateMasterPasswordDialog
                    toggleDialog={setUpdatePasswordDialog}
                    newMasterPassword={generatedPassword}
                    hasMasterPassword={hasMasterPassword}
                />
            )}
        </main>
    );
}

function UpdateMasterPasswordDialog({
    toggleDialog,
    newMasterPassword,
    hasMasterPassword,
}: {
    toggleDialog: React.Dispatch<React.SetStateAction<boolean>>;
    newMasterPassword: string;
    hasMasterPassword: boolean;
}) {
    const [previousMasterPassword, setPreviousMasterPassword] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);

    const [errors, setErrors] = useState({
        previousMasterPassword: "",
        general: "",
    });

    const [consents, setConsents] = useState({
        dataLoss: false,
        replacesOldPassword: false,
        safekeeping: false,
    });

    const handleCopy = () => {
        if (!newMasterPassword) {
            return;
        }

        writeTextToClipboard(newMasterPassword);
        setCopySuccess(true); // Show success message
        setTimeout(() => setCopySuccess(false), 2000); // Hide after 2 seconds
    };

    const updateMasterPassword = async () => {
        // This should not be possible
        // but just in case
        if (!hasConsented) {
            return;
        }

        setErrors({ previousMasterPassword: "", general: "" });

        try {
            if (hasMasterPassword) {
                if (!previousMasterPassword) {
                    setErrors((prev) => ({
                        ...prev,
                        previousMasterPassword: "Your previous master password is required",
                    }));
                    return;
                }

                // If the user had a previous master password
                // there may be passwords that need to be re-encrypted
                const passwords = await getStoredPasswords();

                // Re-encrypt them with the new master password
                const updatedPasswords = await Promise.all(
                    passwords.map(async (password) => {
                        const decrypted = await decrypt(password.value, previousMasterPassword);

                        if (!decrypted) {
                            throw new Error("Invalid previous master password");
                        }
                        const encrypted = await encrypt(decrypted, newMasterPassword);

                        return {
                            ...password,
                            value: encrypted,
                            last_updated: Date.now(),
                        };
                    })
                );

                if (updatedPasswords.length) {
                    await setStoredPasswords(updatedPasswords);
                }
            }

            await saveMasterPasswordVerification(newMasterPassword);
            toggleDialog(false);

            // Redirect to the vault
            window.location.assign("/");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                general: err instanceof Error ? err.message : "An error occurred",
            }));
        }
    };

    useEffect(() => {
        setHasConsented(
            consents.dataLoss &&
                consents.safekeeping &&
                (consents.replacesOldPassword || !hasMasterPassword)
        );
    }, [consents, hasMasterPassword]);

    return (
        <Dialog onClose={() => toggleDialog(false)}>
            <div>
                <div className="p-6 max-w-5xl">
                    <h3 className="text-2xl font-bold text-white mb-6">
                        {hasMasterPassword ? "Update Master Password" : "Set Master Password"}
                    </h3>

                    {/* Warning Notice */}
                    {hasMasterPassword && (
                        <div className="p-4 rounded-lg border border-red-500 bg-red-500/10 mb-6">
                            <p className="text-red-400 text-sm">
                                Changing your master password will re-encrypt all your stored
                                passwords. Make sure to safely store the new master password, as
                                losing it will result in permanent loss of access to your previous
                                passwords.
                            </p>
                        </div>
                    )}

                    {/* Previous Password Input */}
                    {hasMasterPassword && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-passfort-vibrant mb-2">
                                Previous Master Password
                            </label>
                            <input
                                type="password"
                                value={previousMasterPassword}
                                className="w-full p-3 rounded-lg bg-transparent text-sm border focus:ring-0 placeholder:text-passfort-vibrant text-passfort-vibrant focus:border-passfort-vibrant border-passfort-vibrant/50"
                                onChange={(e) => setPreviousMasterPassword(e.target.value)}
                                placeholder="Enter your current master password"
                            />

                            {errors.previousMasterPassword && (
                                <div className="flex items-center mt-1 text-sm text-red-500">
                                    <ExclamationIcon className="w-4 h-4 mr-1" />
                                    {errors.previousMasterPassword}
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Password Preview */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-passfort-vibrant mb-2">
                            New Master Password
                        </label>
                        <div className="flex bg-passfort/25 px-3 py-1 items-center rounded-lg border border-passfort-vibrant/50 font-mono text-passfort-vibrant">
                            <div className="flex-1">{newMasterPassword}</div>
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                aria-label="Copy to clipboard">
                                <CopyIcon
                                    className={`w-6 h-6 ${
                                        copySuccess
                                            ? "text-zinc-200 group-hover:text-white"
                                            : "text-passfort-vibrant group-hover:text-white"
                                    }  transition-colors`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Consent Checkboxes */}
                    {hasMasterPassword && (
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={consents.replacesOldPassword}
                                    onChange={(e) =>
                                        setConsents((prev) => ({
                                            ...prev,
                                            replacesOldPassword: e.target.checked,
                                        }))
                                    }
                                    className="w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant checked:bg-passfort-vibrant focus:ring-0"
                                />
                                <span className="ml-2 text-sm text-passfort-vibrant">
                                    I understand that this new master password will replace my
                                    previous master password
                                </span>
                            </label>
                        </div>
                    )}
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={consents.dataLoss}
                                onChange={(e) =>
                                    setConsents((prev) => ({
                                        ...prev,
                                        dataLoss: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant checked:bg-passfort-vibrant focus:ring-0"
                            />
                            <span className="ml-2 text-sm text-passfort-vibrant">
                                I understand that losing this master password will result in
                                permanent loss of access to my stored passwords
                            </span>
                        </label>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={consents.safekeeping}
                                onChange={(e) =>
                                    setConsents((prev) => ({
                                        ...prev,
                                        safekeeping: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant checked:bg-passfort-vibrant focus:ring-0 focus:border-none"
                            />
                            <span className="ml-2 text-sm text-passfort-vibrant">
                                I have stored this new master password securely
                            </span>
                        </label>
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={updateMasterPassword}
                        disabled={!hasConsented}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                            hasConsented
                                ? "bg-passfort-vibrant hover:bg-passfort-vibrant/90"
                                : "bg-passfort-vibrant/25 cursor-not-allowed"
                        }`}>
                        Update Master Password
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
