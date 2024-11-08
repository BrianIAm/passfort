"use client";

import { Dialog } from "#/components/Dialog";
import { encrypt, decrypt, verifyMasterPassword } from "#/lib/encrypt";
import { type Password } from "#/types/password";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
    getStoredPasswords,
    setStoredPasswords,
    getMasterPasswordVerification,
    hasMasterPasswordVerification,
} from "#/lib/fs";
import {
    AddIcon,
    ClockIcon,
    EyeIcon,
    LockIcon,
    TrashIcon,
    UnlockIcon,
    ExclamationIcon,
    ShieldIcon,
} from "#/icons";

const UNLOCK_DURATION = 60_000; // 30 seconds

export default function Page() {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [masterPassword, setMasterPassword] = useState<string>("");
    const [lastUnlockTime, setLastUnlockTime] = useState<number>(0);
    const [isAddingPassword, setIsAddingPassword] = useState(false);
    const [isUnlockingPasswords, setIsUnlockingPasswords] = useState(false);
    const [hasMasterPassword, setHasMasterPassword] = useState(false);

    const deletePassword = async (password: Password) => {
        const updatedPasswords = passwords.filter(
            // Filter out the password to delete
            (prevPassword) =>
                prevPassword.name !== password.name &&
                prevPassword.associated_identifier !==
                    password.associated_identifier &&
                prevPassword.value !== password.value
        );

        await setStoredPasswords(updatedPasswords);
        setPasswords(updatedPasswords);
    };

    const loadPasswords = async () => {
        setPasswords(await getStoredPasswords());
    };

    useEffect(() => {
        const watcherInterval = setInterval(loadPasswords, 3_000);

        loadPasswords();
        return () => clearInterval(watcherInterval);
    }, []);

    useEffect(() => {
        const unlockInterval = setInterval(() => {
            setMasterPassword("");
            setLastUnlockTime(0);
        }, UNLOCK_DURATION);

        if (masterPassword) {
            setLastUnlockTime(Date.now());
        }

        return () => clearInterval(unlockInterval);
    }, [masterPassword]);

    useEffect(() => {
        hasMasterPasswordVerification().then((hasToken) =>
            setHasMasterPassword(hasToken)
        );
    }, []);

    return (
        <main className="w-full">
            <UnlockProgressBar lastUnlockTime={lastUnlockTime} />

            <div className="flex-1 px-8 py-4 max-w-7xl">
                {/* Modals */}
                {isAddingPassword && (
                    <AddPasswordModal setIsModalShowing={setIsAddingPassword} />
                )}

                {isUnlockingPasswords && (
                    <UnlockPasswordsModal
                        setMasterPassword={setMasterPassword}
                        setIsModalShowing={setIsUnlockingPasswords}
                    />
                )}

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold">Password Vault</h2>
                        <p className="text-passfort-vibrant mt-2">
                            Securely store and manage your passwords
                        </p>
                    </div>

                    {passwords.length > 0 && (
                        <div className="flex gap-4">
                            <button
                                className="flex items-center px-4 py-2 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 hover:bg-passfort-vibrant/20 transition-colors"
                                aria-label="Add new password"
                                onClick={() => setIsAddingPassword(true)}>
                                <AddIcon className="w-5 h-5 mr-2" />
                                <span>Add Password</span>
                            </button>
                            <button
                                className="flex items-center px-4 py-2 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 hover:bg-passfort-vibrant/20 transition-colors"
                                aria-label="Unlock passwords"
                                onClick={() => setIsUnlockingPasswords(true)}>
                                {masterPassword ? (
                                    <>
                                        <UnlockIcon className="w-5 h-5 mr-2" />
                                        <span>Vault Unlocked</span>
                                    </>
                                ) : (
                                    <>
                                        <LockIcon className="w-5 h-5 mr-2" />
                                        <span>Vault Locked</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Vault Lock Status Info */}
                {masterPassword && (
                    <div className="mb-6 p-4 rounded-lg border border-green-500 bg-green-500/10">
                        <div className="flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2 text-green-500" />
                            <span className="text-green-400">
                                Vault unlocked - Will auto-lock in{" "}
                                {Math.ceil(
                                    (UNLOCK_DURATION -
                                        (Date.now() - lastUnlockTime)) /
                                        1000
                                )}{" "}
                                seconds
                            </span>
                        </div>
                    </div>
                )}

                {/* No Master Password Disclaimer */}
                {!hasMasterPassword && (
                    <div className="p-8 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 text-center">
                        <h3 className="text-xl font-bold mb-4">
                            No Master Password Set
                        </h3>
                        <p className="text-passfort-vibrant mb-6">
                            You haven&apos;t set a master password yet. To start
                            using PassFort, set a master password to secure your
                        </p>
                        <Link
                            href="/master-password"
                            className="px-4 py-2 rounded-lg bg-passfort-vibrant hover:bg-passfort-vibrant/80 transition-colors">
                            Setup Master Password
                        </Link>
                    </div>
                )}

                {/* Password Grid */}
                {hasMasterPassword && passwords.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                        {passwords.map((password: Password, index: number) => (
                            <StoredPasswordComponent
                                key={`${password.name.toLowerCase()}-${index}`}
                                password={password}
                                deletePassword={deletePassword}
                                masterPassword={masterPassword}
                            />
                        ))}
                    </div>
                )}

                {/* Empty Vault */}
                {hasMasterPassword && passwords.length <= 0 && (
                    <div className="p-8 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 text-center">
                        <h3 className="text-xl font-bold mb-4">
                            No Passwords Yet
                        </h3>
                        <p className="text-passfort-vibrant mb-6">
                            Your vault is empty. Start by adding your first
                            password.
                        </p>
                        <button
                            className="px-4 py-2 rounded-lg bg-passfort-vibrant hover:bg-passfort-vibrant/80 transition-colors"
                            onClick={() => setIsAddingPassword(true)}>
                            Add Your First Password
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

function AddPasswordModal({
    setIsModalShowing,
}: {
    setIsModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [errors, setErrors] = useState<{ [key: string]: string }>({
        name: "",
        password: "",
        masterPassword: "",
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});

        const form = event.currentTarget;
        const name = form.elements.namedItem("name") as HTMLInputElement;
        const identifier = form.elements.namedItem(
            "identifier"
        ) as HTMLInputElement;
        const password = form.elements.namedItem(
            "password"
        ) as HTMLInputElement;
        const masterPassword = form.elements.namedItem(
            "master-password"
        ) as HTMLInputElement;

        const newErrors: { [key: string]: string } = {};

        if (!name.value) {
            newErrors.name = "Name is required";
        }

        if (!password.value) {
            newErrors.password = "Password is required";
        }

        if (!masterPassword.value) {
            newErrors.masterPassword = "Master password is required";
        }

        if (
            masterPassword.value.length < 8 ||
            masterPassword.value.length > 64
        ) {
            newErrors.masterPassword =
                "Master password must be between 8 and 64 characters";
        }

        const isVerified = await verifyMasterPassword(masterPassword.value);
        if (!isVerified) {
            newErrors.masterPassword = "Incorrect master password";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await addPassword({
            name: name.value,
            associated_identifier: identifier.value,
            value: password.value,
            last_updated: Date.now(),
        });

        setIsModalShowing(false);
    };

    const addPassword = async (password: Password) => {
        const storedPasswords = await getStoredPasswords();
        storedPasswords.push(password);
        await setStoredPasswords(storedPasswords);
    };

    return (
        <Dialog onClose={() => setIsModalShowing(false)}>
            <div className="rounded-lg">
                <form
                    className="flex flex-col p-6 min-w-[500px]"
                    onSubmit={handleSubmit}>
                    <h3 className="text-2xl font-bold text-white mb-6">
                        Add New Password
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block font-medium text-passfort-vibrant mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                className={`bg-passfort/25 w-full p-3 rounded-lg border[&:autofill]:bg-none [&:-webkit-autofill]:bg-none
                                ${
                                    errors.name
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-passfort-vibrant/50 focus:border-passfort-vibrant"
                                } focus:ring-0 transition-colors`}
                            />
                            {errors.name && (
                                <div className="flex items-center mt-1 text-sm text-red-500">
                                    <ExclamationIcon className="w-4 h-4 mr-1" />
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="identifier"
                                className="block font-medium text-passfort-vibrant mb-1">
                                Identifier
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                className="bg-passfort/25 w-full p-3 rounded-lg border border-passfort-vibrant/50 focus:border-passfort-vibrant focus:ring-0 transition-colors"
                            />
                            <p className="mt-1 text-xs text-passfort-vibrant/75">
                                Username or email associated with this password
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-medium text-passfort-vibrant mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                className={`bg-passfort/25 w-full p-3 rounded-lg border ${
                                    errors.password
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-passfort-vibrant/50 focus:border-passfort-vibrant"
                                } focus:ring-0 transition-colors`}
                            />
                            {errors.password && (
                                <div className="flex items-center mt-1 text-sm text-red-500">
                                    <ExclamationIcon className="w-4 h-4 mr-1" />
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Security Notice */}
                        <div className="p-4 rounded-lg border border-red-500 bg-red-500/10">
                            <div className="flex items-center mb-4">
                                <ShieldIcon className="w-6 h-6 text-red-400 mr-2" />
                                <h3 className="text-xl font-bold text-red-400">
                                    Encode with Master Password
                                </h3>
                            </div>
                            <div className="space-y-4 text-red-400">
                                <p>
                                    Use your master password to encode this
                                    password. Without it, it is stored in plain
                                    text which is not safe if your device is
                                    compromised.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="master-password"
                                className="block font-medium text-passfort-vibrant mb-1">
                                Master Password{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="master-password"
                                autoComplete="master-password"
                                className={`bg-passfort/25 w-full p-3 rounded-lg border ${
                                    errors.masterPassword
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-passfort-vibrant/50 focus:border-passfort-vibrant"
                                } focus:ring-0 transition-colors`}
                            />
                            {errors.masterPassword && (
                                <div className="flex items-center mt-1 text-sm text-red-500">
                                    <ExclamationIcon className="w-4 h-4 mr-1" />
                                    {errors.masterPassword}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsModalShowing(false)}
                            className="px-4 py-2 rounded-lg border border-passfort-vibrant text-passfort-vibrant hover:bg-passfort-vibrant/10 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-passfort-vibrant/80 text-white hover:bg-passfort-vibrant transition-colors">
                            Add Password
                        </button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
}

function UnlockPasswordsModal({
    setMasterPassword,
    setIsModalShowing,
}: {
    setMasterPassword: React.Dispatch<React.SetStateAction<string>>;
    setIsModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const form = event.currentTarget;
        const masterPassword = form.elements.namedItem(
            "master-password"
        ) as HTMLInputElement;

        if (!masterPassword.value) {
            setError("Master password is required");
            return;
        }

        const isVerified = await verifyMasterPassword(masterPassword.value);

        if (!isVerified) {
            setError("Incorrect master password");
            return;
        }

        setMasterPassword(masterPassword.value);
        setIsModalShowing(false);
    };

    return (
        <Dialog onClose={() => setIsModalShowing(false)}>
            <div className="p-4 text-passfort-vibrant">
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    Unlock Your Passwords
                </h2>
                <p className="mb-4">
                    Enter your master password to temporarily access your stored
                    passwords.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        id="master-password"
                        autoComplete="current-password"
                        aria-label="Master password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-transparent w-full text-passfort-vibrant border border-passfort-vibrant rounded-lg px-2 focus:ring-0 focus:border-passfort-vibrant"
                    />

                    {error && (
                        <div className="flex items-center mt-2 text-sm text-red-500">
                            <ExclamationIcon className="w-4 h-4 mr-1" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="mt-4 text-white px-4 py-2 rounded font-semibold bg-passfort-vibrant">
                        Unlock
                    </button>
                </form>
            </div>
        </Dialog>
    );
}

function UnlockProgressBar({ lastUnlockTime }: { lastUnlockTime: number }) {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const timeElapsed = Date.now() - lastUnlockTime;
            const progress = 100 - (timeElapsed / UNLOCK_DURATION) * 100;
            setProgress(progress);
        }, 10);

        return () => clearInterval(interval);
    }, [lastUnlockTime]);

    if (lastUnlockTime === 0) return null;

    return (
        <div className="h-2">
            <div
                className="rounded-r-xl h-full bg-passfort-vibrant"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

function StoredPasswordComponent({
    password,
    masterPassword,
    deletePassword,
}: {
    password: Password;
    masterPassword: string;
    deletePassword: (password: Password) => void;
}) {
    const [isRevealed, setIsRevaled] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const revealPasswordMomentarily = () => {
        if (isRevealed) return;
        setIsRevaled(true);
        setTimeout(() => setIsRevaled(false), 5000);
    };

    return (
        <div className="rounded-xl border-2 border-zinc-700 p-6 shadow-lg hover:border-passfort-vibrant/50 transition-colors">
            <div
                className={`flex items-center justify-between ${
                    password.associated_identifier ? "mb-4" : "mb-8"
                }`}>
                <div>
                    <h3 className="text-xl font-medium mb-1">
                        {password.name.length > 20
                            ? password.name.slice(0, 20) + "..."
                            : password.name}
                    </h3>
                    {password.associated_identifier && (
                        <p
                            className={`text-sm text-passfort-vibrant/75 ${
                                !isRevealed && "blur-sm"
                            }`}>
                            {isRevealed
                                ? password.associated_identifier
                                : "passfort@example.com"}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    {masterPassword && (
                        <>
                            <button
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                onClick={revealPasswordMomentarily}
                                aria-label="Reveal password">
                                <EyeIcon className="w-5 h-5 text-white" />
                            </button>
                        </>
                    )}

                    <button
                        className="p-2 rounded-lg hover:bg-passfort-vibrant/10 transition-colors group"
                        onClick={() => setShowDeleteConfirm(true)}
                        aria-label="Delete password">
                        <TrashIcon className="w-5 h-5 text-passfort-vibrant group-hover:text-red-600 transition-colors" />
                    </button>
                </div>
            </div>
            <div className="relative">
                <div
                    className={`font-mono p-3 rounded-lg bg-zinc-800/50 ${
                        isRevealed ? "text-white" : "text-zinc-500"
                    }`}>
                    {isRevealed ? password.value : "••••••••"}
                </div>
                {isRevealed && (
                    <div className="absolute -top-2 right-0 text-xs text-red-500">
                        Visible for 5 seconds
                    </div>
                )}
            </div>

            {showDeleteConfirm && (
                <Dialog onClose={() => setShowDeleteConfirm(false)}>
                    <h2 className="font-bold text-2xl text-white mb-2">
                        Confirm Deletion
                    </h2>
                    <p className="text-passfort-vibrant">
                        Are you sure you want to delete this password? This
                        action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-200 bg-zinc-200/10 hover:bg-zinc-200/25">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                deletePassword(password);
                                setShowDeleteConfirm(false);
                            }}
                            className="px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-600 transition-colors">
                            Delete
                        </button>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
