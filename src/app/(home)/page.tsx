"use client";

import { Dialog } from "#/components/Dialog";
import { encrypt, decrypt, generateMasterPassword } from "#/util/encrypt";
import { getStoredPasswords, setStoredPasswords } from "#/util/fs";
import { type Password } from "#/types/password";
import { writeText as writeTextToClipboard } from "@tauri-apps/plugin-clipboard-manager";
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
            <AddPasswordPanel />
            <PasswordsPanel
                passwords={passwords}
                deletePassword={deletePassword}
            />
            <MasterPasswordPanel />
        </main>
    );
}

function AddPasswordPanel() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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

        setIsModalOpen(false);
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
        <div className="my-4 ">
            {isModalOpen && (
                <Dialog onClose={() => setIsModalOpen(false)}>
                    <form
                        className="p-4 mt-4 flex flex-col gap-4"
                        onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold">
                            Add New Password
                        </h2>

                        <label htmlFor="name" className="block text-gray-400">
                            Name
                            <span className="font-bold text-red-500">*</span>
                            <input
                                type="text"
                                id="name"
                                className="bg-transparent w-full p-2 mt-1  text-zinc-500 rounded-lg border-2 border-zinc-500 focus:outline-none"
                            />
                        </label>

                        <label
                            htmlFor="identifier"
                            className="block text-gray-400">
                            Identified (Email, username etc.)
                            <input
                                type="text"
                                id="identifier"
                                className="bg-transparent w-full p-2 mt-1  text-zinc-500 rounded-lg border-2 border-zinc-500 focus:outline-none"
                            />
                        </label>

                        <label
                            htmlFor="password"
                            className="block text-gray-400">
                            Password
                            <span className="font-bold text-red-500">*</span>
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                className="bg-transparent w-full p-2 mt-1  text-zinc-500 rounded-lg border-2 border-zinc-500 focus:outline-none"
                            />
                        </label>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={test}
                                type="button"
                                className="p-2 rounded bg-red-500 text-white">
                                Test
                            </button>
                            <button className="p-2 rounded bg-red-500 text-white">
                                Add password
                            </button>
                        </div>
                    </form>
                </Dialog>
            )}
        </div>
    );
}

function PasswordsPanel({
    passwords,
    deletePassword,
}: {
    passwords: Password[];
    deletePassword: (password: Password) => void;
}) {
    return (
        <>
            <div className="flex gap-4 align-middle">
                <h2 className="mb-4 text-3xl font-bold">Passwords</h2>
                <button className="w-8 h-8 text-white">
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

            {passwords.length <= 0 ? (
                <div className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                    <p className="text-normal text-passfort-vibrant">
                        No passwords stored yet. Add new passwords to get
                        started.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                    {passwords.map((password: Password, index: number) => (
                        <StoredPasswordComponent
                            key={`${password.name.toLowerCase()}-${index}`}
                            password={password}
                            deletePassword={deletePassword}
                        />
                    ))}
                </div>
            )}
        </>
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
                        <p className="text-gray-400">
                            To unlock your password, please enter your master
                            password.
                        </p>
                        <div className="mt-4">
                            <label
                                htmlFor="master-password"
                                className="block text-gray-400">
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

function MasterPasswordPanel() {
    const generatePassword = async (
        length: number | null,
        options: number | null
    ) => {
        setGeneratedPassword(await generateMasterPassword(length, options));
    };

    const [generatedPassword, setGeneratedPassword] = useState<string>("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [generatedPasswordOptions, setGeneratedPasswordOptions] =
        useState(0b1111);
    const [generatedPasswordLength, setGeneratedPasswordLength] = useState(8);

    const getPassword = (name: string): string => {
        return `password for ${name}`;
    };

    const isBitChecked = (field: number, bit: number) => {
        return (field & bit) !== 0;
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

    useEffect(() => {
        console.log(isBitChecked(0b1111, 0b0001));
    });

    return (
        <section className="mt-6">
            <h2 className="mb-6 text-3xl font-bold">Master Password</h2>
            <div className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                <div className="flex items-center mb-3">
                    <span className="text-sm font-semibold me-2 px-2.5 py-0.5 rounded bg-red-200 text-red-800">
                        Important Notice
                    </span>
                </div>

                <p className="mb-3 text-passfort-vibrant">
                    PassFort recommends using a master password to securely
                    manage your other passwords.
                    <br />
                    <br />
                    This provides an additional layer of security by further
                    encrypting your passwords
                    <u className="underline m-1 text-red-300 font-bold decoration-red-500 decoration-2">
                        with the master password.
                    </u>
                    Although you can use a permanent master password, we suggest
                    changing it periodically for enhanced security. If you
                    choose to enable periodic changes, you can customize the
                    frequency in your settings. We will notify you when
                    it&apos;s time to update your master password, but the
                    change won&apos;t be automatic—you&apos;ll be prompted to
                    generate a new one so you can securely store it yourself.
                    Please note that
                    <u className="underline m-1 text-red-300 font-bold decoration-red-500 decoration-2">
                        we do not store
                    </u>
                    your master password. If you forget it, you will need to
                    reset your account and
                    <u className="underline m-1 text-red-300 font-bold decoration-red-500 decoration-2">
                        all of your passwords will be lost.
                    </u>
                    Such is the price of security.
                </p>
            </div>

            <h4 className="my-4 text-xl font-bold">Generate Master Password</h4>
            <div className="relative w-fit pr-4 py-6 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 mb-6 text-passfort-vibrant">
                <div className="flex w-full gap-8">
                    <div className="flex-row">
                        <div className="flex items-center gap-2 px-4">
                            <input
                                id="lowercase-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0001
                                )}
                                onChange={(e) =>
                                    setGeneratedPasswordOptions(
                                        (prev) => prev ^ 0b0001
                                    )
                                }
                                className="
                                appearance-none
                                w-5 h-5 rounded
                                bg-passfort-vibrant/10 border
                                border-passfort-vibrant
                                focus:ring-0 focus:ring-none
                                focus:border-none
                                focus:outline-none
                                checked:bg-passfort-vibrant
                                "
                            />
                            <label
                                htmlFor="lowercase-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Lowercase
                            </label>
                        </div>

                        <div className="flex items-center gap-2 px-4">
                            <input
                                id="uppercase-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0010
                                )}
                                onChange={(e) =>
                                    setGeneratedPasswordOptions(
                                        (prev) => prev ^ 0b0010
                                    )
                                }
                                className="
                                appearance-none
                                w-5 h-5 rounded
                                bg-passfort-vibrant/10 border
                                border-passfort-vibrant
                                focus:ring-0 focus:ring-none
                                focus:border-none
                                focus:outline-none
                                checked:bg-passfort-vibrant
                                "
                            />
                            <label
                                htmlFor="uppercase-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Uppercase
                            </label>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <input
                                id="numbers-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0100
                                )}
                                onChange={(e) =>
                                    setGeneratedPasswordOptions(
                                        (prev) => prev ^ 0b0100
                                    )
                                }
                                className="
                                appearance-none
                                w-5 h-5 rounded
                                bg-passfort-vibrant/10 border
                                border-passfort-vibrant
                                focus:ring-0 focus:ring-none
                                focus:border-none
                                focus:outline-none
                                checked:bg-passfort-vibrant
                                "
                            />
                            <label
                                htmlFor="numbers-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Numbers
                            </label>
                        </div>

                        <div className="flex items-center gap-2 px-4">
                            <input
                                id="symbols-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b1000
                                )}
                                onChange={(e) =>
                                    setGeneratedPasswordOptions(
                                        (prev) => prev ^ 0b1000
                                    )
                                }
                                className="
                                appearance-none
                                w-5 h-5 rounded
                                bg-passfort-vibrant/10 border
                                border-passfort-vibrant
                                focus:ring-0 focus:ring-none
                                focus:border-none
                                focus:outline-none
                                checked:bg-passfort-vibrant
                                "
                            />
                            <label
                                htmlFor="symbols-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Symbols
                            </label>
                        </div>
                    </div>

                    <div className="w-[42rem]">
                        <label htmlFor="password-length-slider">Length</label>
                        <input
                            id="password-length-slider"
                            className="range w-full h-2 rounded-lgcursor-pointer bg-passfort-vibrant/10 mb-6 accent-passfort-vibrant"
                            type="range"
                            defaultValue={generatedPasswordLength}
                            min={8}
                            max={64}
                            step={8}
                            onChange={(event) =>
                                setGeneratedPasswordLength(
                                    parseInt(event.target.value, 10)
                                )
                            }
                        />
                        <div className="relative w-full mb-4">
                            <span className="text-sm text-passfort-vibrant absolute start-0 -bottom-2">
                                Min (8)
                            </span>
                            {[16, 24, 32, 40, 48, 56].map((value, index) => (
                                <span
                                    key={value}
                                    className="text-sm text-passfort-vibrant absolute -bottom-2"
                                    style={{
                                        left: `${((index + 1) / 7) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}>
                                    {value}
                                </span>
                            ))}
                            <span className="text-sm text-passfort-vibrant absolute end-0 -bottom-2">
                                Max (64)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`flex gap-4 px-3 py-2 rounded-lg border w-full ${
                    copySuccess
                        ? "bg-green-900/10 border-green-700"
                        : "bg-passfort-vibrant/10 border-passfort-vibrant"
                }`}>
                <input
                    className={`bg-transparent w-full h-8 ${
                        copySuccess ? "text-green-500" : "text-passfort-vibrant"
                    }`}
                    value={copySuccess ? "Copied!" : generatedPassword}
                    disabled={true}
                />

                <button onClick={handleCopy}>
                    <svg
                        className={`w-8 h-8 ${
                            copySuccess
                                ? "text-green-500 hover:text-green-400"
                                : "text-passfort-vibrant/75 hover:text-passfort-vibrant"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            fillRule="evenodd"
                            d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                            clipRule="evenodd"
                        />
                        <path
                            fillRule="evenodd"
                            d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                <button
                    onClick={() =>
                        generatePassword(
                            generatedPasswordLength,
                            generatedPasswordOptions
                        )
                    }>
                    <svg
                        className={`w-8 h-8 ${
                            copySuccess
                                ? "text-green-500 hover:text-green-400"
                                : "text-passfort-vibrant/75 hover:text-passfort-vibrant"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.676 17.312h.048a4 4 0 0 0-.436-.78L4.174 10.186c-.37.13-.607.519-.607 1.109v9.84c0 1.034.726 2.291 1.621 2.808l9.168 5.294c.544.314 1.026.282 1.32-.023zm-5.627 6.922-1.83-1.057v-1.918l1.83 1.057zm1.556-4.241q-.198.3-.674.505l-.324.12q-.345.135-.451.278a.6.6 0 0 0-.106.38v.242l-1.83-1.056v-.264q0-.442.167-.685.166-.248.705-.466l.324-.125q.29-.114.421-.285a.64.64 0 0 0 .137-.417q0-.377-.243-.728a2.05 2.05 0 0 0-.679-.608 2.8 2.8 0 0 0-.887-.329 3.2 3.2 0 0 0-.994-.04v-1.691q.613.128 1.12.313c.507.185.664.276.978.457q1.237.714 1.886 1.627.65.908.649 1.937 0 .528-.198.834zM27.111 8.247 17.58 2.733c-.895-.518-2.346-.518-3.241 0L4.808 8.247c-.763.442-.875 1.117-.336 1.628l10.578 6.04a3.86 3.86 0 0 0 1.832-.003l10.589-6.06c.512-.508.392-1.17-.36-1.605m-10.806 2.17-.23-.129q-.385-.216-.492-.488-.111-.274.037-.874l.095-.359q.083-.321.016-.525a.55.55 0 0 0-.277-.329q-.329-.184-.788-.133a2.5 2.5 0 0 0-.958.326q-.465.26-.846.653-.385.39-.661.892l-1.476-.827q.498-.5.978-.875c.48-.375.659-.474 1.015-.674q1.401-.786 2.607-.934 1.2-.152 2.098.352.46.258.603.589.138.328.016.865l-.1.356q-.1.382-.041.55.053.165.265.284l.212.118zm2.369 1.327-1.673-.937 2.074-1.162 1.673.937zm9.073-1.57-11.06 6.329a4 4 0 0 0-.459.813v11.84c.287.358.793.414 1.37.081l9.168-5.294c.895-.517 1.621-1.774 1.621-2.808v-9.84c0-.608-.251-1.003-.641-1.121zm-4.6 13.506-1.83 1.056v-1.918l1.83-1.057zm1.556-6.037q-.198.529-.674 1.284l-.324.494q-.345.533-.451.799a1.3 1.3 0 0 0-.106.503v.242l-1.83 1.056v-.264q0-.441.167-.878.166-.442.705-1.279l.324-.5q.29-.447.421-.771.137-.327.137-.575 0-.377-.243-.447-.243-.075-.679.177-.41.237-.887.695-.477.453-.994 1.107v-1.692q.613-.58 1.12-.981c.507-.401.664-.491.978-.673q1.237-.714 1.886-.55.65.159.649 1.188 0 .528-.198 1.062z" />
                    </svg>
                </button>

                <button>
                    <svg
                        className={`w-8 h-8 ${
                            copySuccess
                                ? "text-green-500 hover:text-green-400"
                                : "text-passfort-vibrant/75 hover:text-passfort-vibrant"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            fillRule="evenodd"
                            d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7.414A2 2 0 0 0 20.414 6L18 3.586A2 2 0 0 0 16.586 3H5Zm10 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7V5h8v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </section>
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
