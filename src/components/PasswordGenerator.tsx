'use client';

import React, { useEffect, useState } from 'react';
import { writeText as writeTextToClipboard } from '@tauri-apps/plugin-clipboard-manager';
import { generatePassword } from '#/lib/encrypt';
import { CopyIcon, SaveIcon, GenerateIcon, ShapesIcon } from '#/icons';

const generationOptions = [
    {
        id: 'lowercase',
        label: 'Lowercase',
        range: 'a-z',
        bit: 0b0001,
    },
    {
        id: 'uppercase',
        label: 'Uppercase',
        range: 'A-Z',
        bit: 0b0010,
    },
    {
        id: 'numbers',
        label: 'Numbers',
        range: '0-9',
        bit: 0b0100,
    },
    {
        id: 'symbols',
        label: 'Symbols',
        range: '!@#$',
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
    const [copySuccess, setCopySuccess] = useState(false);
    const [changedOptions, setChangedOptions] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [generatedPasswordLength, setGeneratedPasswordLength] = useState(16);
    const [generatedPasswordOptions, setGeneratedPasswordOptions] = useState(0b0111);
    const [hasInitialPassword, setHasInitialPassword] = useState(false);

    const generateNewPassword = async (length: number | null, options: number | null) => {
        const generatedPassword = await generatePassword(length, options);

        setGeneratedPassword(generatedPassword);
        setChangedOptions(false);
        if (onGenerate) onGenerate(generatedPassword);
    };

    // Only generate on first mount
    useEffect(() => {
        if (!hasInitialPassword) {
            generateNewPassword(generatedPasswordLength, generatedPasswordOptions);
            setHasInitialPassword(true);
        }
    }, [
        generateNewPassword,
        generatedPasswordLength,
        generatedPasswordOptions,
        hasInitialPassword,
    ]);

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
        setChangedOptions(true);
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
        <div className="border border-passfort-500 bg-passfort-900/25 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
                <ShapesIcon className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold text-white">Password Generator</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                    <span className="block font-bold text-white underline decoration-2 decoration-passfort-500">
                        Character Configuration
                    </span>

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
                                <span className="w-6 h-6 mr-2 rounded-sm border-2 border-passfort-500 bg-passfort-900 peer-checked:bg-passfort-500 peer-checked:border-passfort-500 flex items-center justify-center">
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
                                <p className="text-passfort-500">
                                    <span className="text-white">{option.label}</span> (
                                    <span className="text-white font-bold">{option.range}</span>)
                                </p>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    {/* Character length */}
                    <div className="text-center">
                        <span className="font-bold text-white underline decoration-2 decoration-red-500">
                            {generatedPasswordLength}
                        </span>{' '}
                        <span className="font-bold text-red-500">characters</span>
                    </div>

                    <input
                        type="range"
                        min={8}
                        max={256}
                        step={8}
                        value={generatedPasswordLength}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setChangedOptions(true);
                            setGeneratedPasswordLength(value);
                        }}
                        className="range w-full h-2 rounded-lg appearance-none bg-passfort-500/10 accent-passfort-500 cursor-pointer [&::-webkit-slider-thumb]:bg-passfort-500! [&::-webkit-slider-thumb]:hover:bg-passfort-500"
                    />
                    <div className="flex justify-between text-xs text-passfort-500 mt-2">
                        <span>8</span>
                        <span>256</span>
                    </div>
                </div>
            </div>

            {/* Generated Password Display */}
            <div className="relative">
                <div
                    className={`flex items-center px-2 py-2 rounded-lg border ${
                        copySuccess
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-passfort-500 bg-passfort-500/10'
                    }`}
                >
                    <input
                        type="text"
                        value={
                            copySuccess
                                ? 'Copied!'
                                : generatedPassword.substring(0, 88) +
                                  (generatedPassword.length > 88 ? '...' : '')
                        }
                        readOnly
                        className="flex-1 bg-transparent border-none text-lg font-mono focus:ring-0 focus:outline-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                generateNewPassword(
                                    generatedPasswordLength,
                                    generatedPasswordOptions
                                )
                            }
                            className={`p-2 rounded-lg hover:bg-white/10 transition-colors group ${
                                changedOptions ? 'animate-wiggle' : ''
                            }`}
                            aria-label="Generate new password"
                        >
                            <GenerateIcon
                                className={`w-6 h-6 ${
                                    copySuccess
                                        ? 'text-green-500 group-hover:text-white'
                                        : 'text-passfort-500 group-hover:text-white'
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
                                        : 'text-passfort-500 group-hover:text-white'
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
                                            : 'text-passfort-500 group-hover:text-white'
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
