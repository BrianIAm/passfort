"use client";
import { useEffect, useState } from "react";
import { writeText as writeTextToClipboard } from "@tauri-apps/plugin-clipboard-manager";
import { generateMasterPassword } from "#/util/encrypt";

export default function Page() {
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
            <div className="relative w-full py-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 mb-6 text-passfort-vibrant">
                <div className="flex flex-col w-full gap-4 px-4">
                    <ul className="flex gap-8">
                        <li className="flex items-center">
                            <input
                                id="lowercase-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0001
                                )}
                                onChange={() => handleToggleBit(0b0001)}
                                className="appearance-none w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant focus:ring-0 focus:ring-none focus:border-none focus:outline-none checked:bg-passfort-vibrant"
                            />
                            <label
                                htmlFor="lowercase-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Lowercase
                            </label>
                        </li>

                        <li className="flex items-center">
                            <input
                                id="uppercase-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0010
                                )}
                                onChange={() => handleToggleBit(0b0010)}
                                className="appearance-none w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant focus:ring-0 focus:ring-none focus:border-none focus:outline-none checked:bg-passfort-vibrant"
                            />
                            <label
                                htmlFor="uppercase-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Uppercase
                            </label>
                        </li>
                        <li className="flex items-center">
                            <input
                                id="numbers-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b0100
                                )}
                                onChange={() => handleToggleBit(0b0100)}
                                className="appearance-none w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant focus:ring-0 focus:ring-none focus:border-none focus:outline-none checked:bg-passfort-vibrant"
                            />
                            <label
                                htmlFor="numbers-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Numbers
                            </label>
                        </li>

                        <li className="flex items-center">
                            <input
                                id="symbols-checkbox"
                                type="checkbox"
                                defaultChecked={isBitChecked(
                                    generatedPasswordOptions,
                                    0b1000
                                )}
                                onChange={() => handleToggleBit(0b1000)}
                                className="appearance-none w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant focus:ring-0 focus:ring-none focus:border-none focus:outline-none checked:bg-passfort-vibrant"
                            />
                            <label
                                htmlFor="symbols-checkbox"
                                className="ms-2 font-medium text-passfort-vibrant">
                                Symbols
                            </label>
                        </li>
                    </ul>

                    <div className="w-[32rem]">
                        <label htmlFor="password-length-slider">Length</label>
                        <input
                            id="password-length-slider"
                            className="range w-full h-2 rounded-lg cursor-pointer bg-passfort-vibrant/10 mb-6 accent-passfort-vibrant"
                            type="range"
                            defaultValue={generatedPasswordLength}
                            min={8}
                            max={64}
                            step={8}
                            onChange={(event) => {
                                const value = parseInt(event.target.value);
                                setGeneratedPasswordLength(value);
                                generatePassword(
                                    value,
                                    generatedPasswordOptions
                                );
                            }}
                        />
                        <div className="relative w-full mb-2">
                            <span className="text-sm text-passfort-vibrant absolute start-0 -bottom-2">
                                8
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
                                64
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
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
                        />
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
        </main>
    );
}
