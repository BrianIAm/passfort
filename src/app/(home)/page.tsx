"use client";

import { Dialog } from "#/components/Dialog";
import { encrypt, decrypt } from "#/util/encrypt";
import { getStoredPasswords, setStoredPasswords } from "#/util/fs";
import { type Password } from "#/types/password";
import React, { useState, useEffect } from "react";

/*
#380f17
#08f0b13
#dc2011
#efdfc5
#252b2b
#4c4f54
*/

export default function Home() {
    const [passwords, setPasswords] = useState<Password[]>([]);
    const [isAddingPassword, setIsAddingPassword] = useState(false);

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

    useEffect(() => {
        const watcherInterval = setInterval(async () => {
            const latestPasswords = await getStoredPasswords();
            setPasswords(latestPasswords);
        }, 3_000);

        return () => clearInterval(watcherInterval);
    }, []);

    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            {isAddingPassword && (
                <AddPasswordPanel
                    isPanelShowing={isAddingPassword}
                    setIsPanelShowing={setIsAddingPassword}
                />
            )}

            <div className="flex gap-4">
                <h2 className="mb-4 text-3xl font-bold">Passwords</h2>
                <button
                    className="w-8 h-8 text-white"
                    onClick={() => setIsAddingPassword(true)}>
                    <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            fillRule="evenodd"
                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {passwords.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                    {passwords.map((password: Password, index: number) => (
                        <StoredPasswordComponent
                            key={`${password.name.toLowerCase()}-${index}`}
                            password={password}
                            deletePassword={deletePassword}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                    <p className="text-normal text-passfort-vibrant">
                        No passwords stored yet. Add new passwords to get
                        started.
                    </p>
                </div>
            )}
        </main>
    );
}

function StoredPasswordComponent({
    password,
    deletePassword,
}: {
    password: Password;
    deletePassword: (password: Password) => void;
}) {
    const [isRevealed, setIsRevaled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const revealPasswordMomentarily = () => {
        if (isRevealed) return;
        setIsRevaled(true);
        setTimeout(() => setIsRevaled(false), 5000);
    };

    return (
        <div className="rounded-xl border-2 border-zinc-700 py-6 px-6 shadow-lg">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium">{password.name}</h3>
                <div className="flex gap-2">
                    <button
                        className="p-2 rounded group hover:bg-white transition duration-150"
                        onClick={revealPasswordMomentarily}>
                        <EyeIcon className="w-6 h-6 text-white group-hover:text-zinc-600 transition duration-150" />
                        <span className="sr-only">Reveal password</span>
                    </button>

                    <button
                        className="p-2 rounded group hover:bg-white transition duration-150"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}>
                        <UnlockIcon className="w-6 h-6 text-white group-hover:text-zinc-600 transition duration-150" />
                        <span className="sr-only">Unlock password</span>
                    </button>

                    <button
                        className="p-2 rounded group hover:bg-passfort-vibrant transition duration-150"
                        onClick={() => deletePassword(password)}>
                        <TrashIcon className="w-6 h-6 text-passfort-vibrant group-hover:text-white transition duration-150" />
                        <span className="sr-only">Delete password</span>
                    </button>
                </div>
            </div>
            <p
                className={`font-bold ${
                    isRevealed ? "mt-2 text-xl" : "mt-4 text-2xl"
                } text-passfort-vibrant opacity-50`}>
                {isRevealed ? password.value : "********"}
            </p>

            {isModalOpen && (
                <Dialog onClose={() => setIsModalOpen(false)}>
                    <div className="p-4">
                        <h2 className="text-xl font-semibold mb-4">
                            Unlock Password
                        </h2>
                        <p className="text-passfort-vibrant">
                            To unlock your password, please enter your master
                            password.
                        </p>
                        <div className="mt-4">
                            <label
                                htmlFor="master-password"
                                className="block text-passfort-vibrant">
                                Master Password
                                <input
                                    type="password"
                                    id="master-password"
                                    autoComplete="current-password"
                                    className="bg-transparent w-full p-2 mt-1  text-zinc-500 rounded-lg border-2 border-zinc-500 focus:outline-none"
                                />
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="p-2 rounded bg-red-500 text-white">
                                Unlock
                            </button>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
}

function AddPasswordPanel({
    isPanelShowing,
    setIsPanelShowing,
}: {
    isPanelShowing: boolean;
    setIsPanelShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget as HTMLFormElement;
        const name = form.elements.namedItem("name") as HTMLInputElement;
        const identifier = form.elements.namedItem(
            "identifier"
        ) as HTMLInputElement;
        const password = form.elements.namedItem(
            "password"
        ) as HTMLInputElement;

        if (!name.value || !password.value) {
            alert("Name and password are required.");
            return;
        }

        await addPassword({
            name: name.value,
            associated_identifier: identifier.value,
            value: password.value,
        });

        setIsPanelShowing(false);
    };

    const addPassword = async (password: Password) => {
        const storedPasswords = await getStoredPasswords();
        storedPasswords.push(password);
        await setStoredPasswords(storedPasswords);
    };

    const test = async () => {
        const storedPasswords = await getStoredPasswords();
        //console.log("Reading stored:", { storedPasswords });

        // await addPassword({
        //     name: "Google",
        //     password: "password123",
        // });
    };

    return (
        <Dialog onClose={() => setIsPanelShowing(false)}>
            <form
                className="flex flex-col gap-4 px-4 py-2 text-white min-w-[500px]"
                onSubmit={handleSubmit}>
                <h3 className="text-2xl font-semibold text-red-600">
                    Add New Password
                </h3>

                <label
                    htmlFor="name"
                    className="block text-lg font-bold text-red-600">
                    Name
                    <span>*</span>
                    <input
                        type="text"
                        id="name"
                        className="bg-transparent w-full p-2 mt-1 text-white rounded-lg border border-passfort-vibrant focus:border-passfort-vibrant focus:ring-0"
                    />
                </label>

                <label
                    htmlFor="identifier"
                    className="block text-lg font-bold text-red-600">
                    Identifier
                    <p className="text-red-700 text-xs italic">
                        This can be a username or email associated with this
                        password
                    </p>
                    <input
                        type="text"
                        id="identifier"
                        className="bg-transparent w-full p-2 mt-1 text-white rounded-lg border border-passfort-vibrant focus:border-passfort-vibrant focus:ring-0"
                    />
                </label>

                <label
                    htmlFor="password"
                    className="block text-lg font-bold text-red-600">
                    Password
                    <span>*</span>
                    <input
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        className="bg-transparent w-full p-2 mt-1 text-white rounded-lg border border-passfort-vibrant focus:border-passfort-vibrant focus:ring-0"
                    />
                </label>

                <div className="mt-4 flex gap-4 justify-end">
                    <button
                        onClick={test}
                        type="button"
                        className="px-4 py-2 font-semibold first-line:py-1 rounded-lg border border-passfort-vibrant">
                        Test
                    </button>
                    <button className="px-4 py-2 font-semibold first-line:py-1 rounded-lg border border-passfort-vibrant">
                        Add password
                    </button>
                </div>
            </form>
        </Dialog>
    );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function UnlockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14v3m4-6V7a3 3 0 1 1 6 0v4M5 11h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
            />
        </svg>
    );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}
