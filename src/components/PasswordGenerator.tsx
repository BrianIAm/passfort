'use client';

import React, { useEffect, useState } from 'react';
import { writeText as writeTextToClipboard } from '@tauri-apps/plugin-clipboard-manager';
import { generatePassword } from '#/lib/encrypt';
import { CopyIcon, SaveIcon, GenerateIcon, ShapesIcon } from '#/icons';

const generationOptions = [
    {
        id: 'lowercase',
        label: 'Lowercase (a-z)',
        bit: 0b0001,
    },
    {
        id: 'uppercase',
        label: 'Uppercase (A-Z)',
        bit: 0b0010,
    },
    {
        id: 'numbers',
        label: 'Numbers (0-9)',
        bit: 0b0100,
    },
    {
        id: 'symbols',
        label: 'Symbols (!@#$)',
        bit: 0b1000,
    },
];

export function PasswordGenerator({
    onGenerate,
    onSave,
}: {
    onGenerate?: (password: string) => void;
    onSave?: (password?: string) => void;
}) {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [generatedPasswordLength, setGeneratedPasswordLength] = useState(16);
    const [copySuccess, setCopySuccess] = useState(false);
    const [generatedPasswordOptions, setGeneratedPasswordOptions] = useState(0b0111);
    const [hasInitialPassword, setHasInitialPassword] = useState(false);

    const generateNewPassword = async (length: number | null, options: number | null) => {
        const generatedPassword = await generatePassword(length, options);

        setGeneratedPassword(generatedPassword);
        if (onGenerate) onGenerate(generatedPassword);
    };

    // Only generate on first mount
    useEffect(() => {
        if (!hasInitialPassword) {
            generateNewPassword(generatedPasswordLength, generatedPasswordOptions);
            setHasInitialPassword(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isBitChecked = (field: number, bit: number) => {
        return (field & bit) !== 0;
    };

    const handleToggleBit = (bit: number) => {
        // Toggle the bit
        let updatedBitfield = generatedPasswordOptions ^ bit;
        // If none of the bits are set, set all of them
        if (updatedBitfield === 0) {
            updatedBitfield = 0b1111;
        }

        // Update the bitfield and regenerate the password
        setGeneratedPasswordOptions(updatedBitfield);
    };

    const handleCopy = () => {
        if (!generatedPassword) {
            return;
        }

        writeTextToClipboard(generatedPassword);
        // This will show the "Copied!" message
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Hide after 2 seconds
    };

    return (
        <div className="border border-passfort-vibrant bg-passfort/25 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <ShapesIcon className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold text-white">Password Generator</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                    <span className="block font-bold text-white">Character Configuration</span>

                    <div className="flex flex-col gap-4">
                        {generationOptions.map((option) => (
                            <label
                                key={option.id}
                                className="group inline-flex items-center cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isBitChecked(generatedPasswordOptions, option.bit)}
                                    onChange={() => handleToggleBit(option.bit)}
                                />
                                {/* Checkbox */}
                                <span className="w-6 h-6 rounded-sm border-2 border-passfort-vibrant bg-passfort peer-checked:bg-passfort-vibrant peer-checked:border-passfort-vibrant flex items-center justify-center">
                                    <svg
                                        className="text-white opacity-0 group-has-[:checked]:opacity-100"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="square"
                                            strokeLinejoin="round"
                                            strokeWidth="4"
                                            d="M5 12 9 16 18 8"
                                        />
                                    </svg>
                                </span>

                                {/* Label */}
                                <span className="ml-2 text-red-400">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-passfort-vibrant mb-4">
                        Password Length: {generatedPasswordLength} characters
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
                        }}
                        className="range w-full h-2 rounded-lg appearance-none bg-passfort-vibrant/10 accent-passfort-vibrant cursor-pointer [&::-webkit-slider-thumb]:bg-passfort-vibrant! [&::-webkit-slider-thumb]:hover:bg-passfort-vibrant"
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
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-passfort-vibrant bg-passfort-vibrant/10'
                    }`}
                >
                    <input
                        type="text"
                        value={copySuccess ? 'Copied!' : generatedPassword}
                        readOnly
                        className="flex-1 bg-transparent border-none text-lg font-mono focus:ring-0"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                generateNewPassword(
                                    generatedPasswordLength,
                                    generatedPasswordOptions
                                )
                            }
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                            aria-label="Generate new password"
                        >
                            <GenerateIcon
                                className={`w-6 h-6 ${
                                    copySuccess
                                        ? 'text-green-500 group-hover:text-white'
                                        : 'text-passfort-vibrant group-hover:text-white'
                                }  transition-colors`}
                            />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                            aria-label="Copy to clipboard"
                        >
                            <CopyIcon
                                className={`w-6 h-6 ${
                                    copySuccess
                                        ? 'text-green-500 group-hover:text-white'
                                        : 'text-passfort-vibrant group-hover:text-white'
                                }  transition-colors`}
                            />
                        </button>

                        {onSave && (
                            <button
                                onClick={() => onSave(generatedPassword)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                aria-label="Set as master password"
                            >
                                <SaveIcon
                                    className={`w-6 h-6 ${
                                        copySuccess
                                            ? 'text-green-500 group-hover:text-white'
                                            : 'text-passfort-vibrant group-hover:text-white'
                                    }  transition-colors`}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
