"use client";
import React, { useEffect, useState } from "react";
import { writeText as writeTextToClipboard } from "@tauri-apps/plugin-clipboard-manager";
import { generateMasterPassword, encrypt, decrypt } from "#/lib/encrypt";
import { Dialog } from "#/components/Dialog";
import { getStoredPasswords, setStoredPasswords } from "#/lib/fs";
import {
    ShieldIcon,
    CopyIcon,
    ClipboardIcon,
    SaveIcon,
    GenerateIcon,
    ClipboardCheckIcon,
} from "#/icons";

export default function Page() {
    const [generatedPassword, setGeneratedPassword] = useState<string>("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [generatedPasswordOptions, setGeneratedPasswordOptions] =
        useState(0b1111);
    const [generatedPasswordLength, setGeneratedPasswordLength] = useState(8);
    const [showUpdatePasswordDialog, setUpdatePasswordDialog] = useState(false);

    const generationOptions = [
        {
            id: "lowercase",
            label: "Lowercase (a-z)",
            bit: 0b0001,
        },
        {
            id: "uppercase",
            label: "Uppercase (A-Z)",
            bit: 0b0010,
        },
        {
            id: "numbers",
            label: "Numbers (0-9)",
            bit: 0b0100,
        },
        {
            id: "symbols",
            label: "Symbols (!@#$)",
            bit: 0b1000,
        },
    ];

    const generatePassword = async (
        length: number | null,
        options: number | null
    ) => {
        setGeneratedPassword(await generateMasterPassword(length, options));
    };

    const isBitChecked = (field: number, bit: number) => {
        return (field & bit) !== 0;
    };

    const handleToggleBit = (bit: number) => {
        // Toggle the bit
        const updatedBitfield = generatedPasswordOptions ^ bit;
        // Update the bitfield and regenerate the password
        setGeneratedPasswordOptions(updatedBitfield);
        generatePassword(generatedPasswordLength, updatedBitfield);
    };

    const handleCopy = () => {
        if (!generatedPassword) {
            return;
        }

        writeTextToClipboard(generatedPassword);
        setCopySuccess(true); // Show success message
        setTimeout(() => setCopySuccess(false), 2000); // Hide after 2 seconds
    };

    useEffect(() => {
        generatePassword(null, null);
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
                    <ShieldIcon className="w-6 h-6 text-red-500 mr-2" />
                    <h3 className="text-xl font-bold text-red-400">
                        Important Security Notice
                    </h3>
                </div>
                <div className="space-y-4 text-red-400">
                    <p>
                        Your master password is the key to all your stored
                        passwords. Make sure to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Choose a strong, unique password</li>
                        <li>Store it securely offline</li>
                        <li>Never share it with anyone</li>
                        <li>Consider changing it periodically</li>
                    </ul>
                    <p className="font-bold">
                        Warning: If you forget your master password, there is no
                        way to recover your stored passwords. Such is the price
                        of security.
                    </p>
                </div>
            </div>

            {/* Password Generator */}
            <div className="border border-passfort-vibrant bg-passfort/25 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold mb-6">Password Generator</h3>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <label className="block text-passfort-vibrant">
                            Character Types
                        </label>
                        {generationOptions.map((option) => (
                            <div key={option.id} className="flex items-center">
                                <input
                                    id={option.id}
                                    type="checkbox"
                                    checked={isBitChecked(
                                        generatedPasswordOptions,
                                        option.bit
                                    )}
                                    onChange={() => handleToggleBit(option.bit)}
                                    className="w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant 
                                             checked:bg-passfort-vibrant focus:ring-passfort-vibrant"
                                />
                                <label
                                    htmlFor={option.id}
                                    className="ml-2 text-passfort-vibrant">
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-passfort-vibrant mb-4">
                            Password Length: {generatedPasswordLength}{" "}
                            characters
                        </label>
                        <input
                            type="range"
                            min={8}
                            max={64}
                            step={8}
                            value={generatedPasswordLength}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setGeneratedPasswordLength(value);
                                generatePassword(
                                    value,
                                    generatedPasswordOptions
                                );
                            }}
                            className="w-full h-2 rounded-lg appearance-none bg-passfort-vibrant/10 
                                     accent-passfort-vibrant cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-passfort-vibrant mt-2">
                            <span>8</span>
                            <span>64</span>
                        </div>
                    </div>
                </div>

                {/* Generated Password Display */}
                <div className="relative">
                    <div
                        className={`flex items-center px-2 py-2 rounded-lg border ${
                            copySuccess
                                ? "border-green-500 bg-green-500/10"
                                : "border-passfort-vibrant bg-passfort-vibrant/10"
                        }`}>
                        <input
                            type="text"
                            value={copySuccess ? "Copied!" : generatedPassword}
                            readOnly
                            className="flex-1 bg-transparent border-none text-lg font-mono focus:ring-0"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                title="Copy to clipboard">
                                <CopyIcon
                                    className="w-6 h-6 text-passfort-vibrant 
                                                               group-hover:text-white transition-colors"
                                />
                            </button>
                            <button
                                onClick={() =>
                                    generatePassword(
                                        generatedPasswordLength,
                                        generatedPasswordOptions
                                    )
                                }
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                title="Generate new password">
                                <GenerateIcon
                                    className="w-6 h-6 text-passfort-vibrant 
                                                        group-hover:text-white transition-colors"
                                />
                            </button>
                            <button
                                onClick={() => setUpdatePasswordDialog(true)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                title="Set as master password">
                                <SaveIcon
                                    className="w-6 h-6 text-passfort-vibrant 
                                                           group-hover:text-white transition-colors"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showUpdatePasswordDialog && (
                <UpdateMasterPasswordDialog
                    toggleDialog={setUpdatePasswordDialog}
                    masterPassword={generatedPassword}
                />
            )}
        </main>
    );
}

function UpdateMasterPasswordDialog({
    toggleDialog,
    masterPassword,
}: {
    toggleDialog: React.Dispatch<React.SetStateAction<boolean>>;
    masterPassword: string;
}) {
    const [hasConsented, setHasConsented] = useState(false);
    const [previousMasterPassword, setPreviousMasterPassword] = useState("");

    const updateMasterPassword = async () => {
        if (!previousMasterPassword) {
            return;
        }

        // Get all stored passwords
        const passwords = await getStoredPasswords();

        // Decrypt all stored passwords with the previous master password
        // and encrypt them with the new master password
        const updatedPasswords = await Promise.all(
            passwords.map(async (password) => {
                const decrypted = await decrypt(
                    password.value,
                    previousMasterPassword
                );
                if (!decrypted) {
                    // Handle incorrect password
                    throw new Error(
                        `Password with name: ${password.name} could not be decrypted`
                    );
                }

                // Encrypt the password with the new master password
                const encrypted = await encrypt(decrypted, masterPassword);
                // Update the password value
                return {
                    ...password,
                    value: encrypted,
                    last_updated: Date.now(),
                };
            })
        );

        // Save the updated passwords and close the dialog
        await setStoredPasswords(updatedPasswords);
        toggleDialog(false);
    };

    return (
        <Dialog onClose={() => toggleDialog(false)}>
            <div className="my-4 pl-2 pr-12 max-w-5xl">
                <div className="flex items-center mb-3">
                    <span className="text-xl font-semibold me-2 px-2.5 py-0.5 rounded bg-red-200 text-red-800">
                        Warning!
                    </span>
                </div>

                <h3 className="text-3xl font-bold text-passfort-vibrant">
                    Confirm Master Password Update
                </h3>
                <p className="mt-4 text-lg text-passfort-vibrant">
                    Updating your master password will{" "}
                    <span className="font-bold underline text-red-300 decoration-red-500">
                        ONLY
                    </span>{" "}
                    unlock stored passwords with the new password. Securely
                    store the new password, as this change is irreversible.
                </p>
                <p className="my-8 text-xl text-passfort-vibrant">
                    <strong>New Master Password:</strong> {masterPassword}
                </p>

                {!hasConsented ? (
                    <button
                        className="bg-passfort-vibrant px-4 py-2 rounded-lg"
                        onClick={() => setHasConsented(true)}>
                        <span className="text-lg font-semibold">
                            Yes, update!
                        </span>
                    </button>
                ) : (
                    <label className="text-passfort-vibrant font-semibold text-lg">
                        Enter previous master password
                        <small className="block font-normal leading-5 mb-2">
                            This password is required to decode stored passwords
                            correctly. Ensure you use the right password.
                        </small>
                        <div className="flex gap-2 h-10">
                            <input
                                aria-label="Previous master password"
                                className="bg-transparent w-full text-passfort-vibrant border border-passfort-vibrant rounded-lg px-2 focus:ring-0 focus:ring-none focus:border-passfort-vibrant focus:outline-none"
                                type="password"
                                value={previousMasterPassword}
                                onChange={(event) =>
                                    setPreviousMasterPassword(
                                        event.target.value
                                    )
                                }
                            />
                            <button
                                className="bg-passfort-vibrant px-4 py-2 rounded-lg"
                                onClick={updateMasterPassword}>
                                <span className="text-lg font-semibold text-white">
                                    Update
                                </span>
                            </button>
                        </div>
                    </label>
                )}
            </div>
        </Dialog>
    );
}
