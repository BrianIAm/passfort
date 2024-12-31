'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { writeText as writeTextToClipboard } from '@tauri-apps/plugin-clipboard-manager';
import { generatePassword } from '#/lib/encrypt';
import { CopyIcon, SaveIcon, GenerateIcon } from '#/icons';

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
    onGenerate: (password: string) => void;
    onSave?: (password?: string) => void;
}) {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [generatedPasswordLength, setGeneratedPasswordLength] = useState(8);
    const [copySuccess, setCopySuccess] = useState(false);
    const [generatedPasswordOptions, setGeneratedPasswordOptions] =
        useState(0b1111);
    const [hasInitialPassword, setHasInitialPassword] = useState(false);

    const generateNewPassword = async (
        length: number | null,
        options: number | null
    ) => {
        const generatedPassword = await generatePassword(length, options);

        setGeneratedPassword(generatedPassword);
        onGenerate(generatedPassword);
    };

    // Only generate on first mount
    useEffect(() => {
        if (!hasInitialPassword) {
            generateNewPassword(
                generatedPasswordLength,
                generatedPasswordOptions
            );
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
        setCopySuccess(true); // Show success message
        setTimeout(() => setCopySuccess(false), 2000); // Hide after 2 seconds
    };

    return (
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
                                className="w-5 h-5 rounded bg-passfort-vibrant/10 border border-passfort-vibrant checked:bg-passfort-vibrant focus:ring-passfort-vibrant"
                            />
                            <label
                                htmlFor={option.id}
                                className="ml-2 text-passfort-vibrant"
                            >
                                {option.label}
                            </label>
                        </div>
                    ))}
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
                        className="range w-full h-2 rounded-lg appearance-none bg-passfort-vibrant/10 accent-passfort-vibrant cursor-pointer [&::-webkit-slider-thumb]:!bg-passfort-vibrant [&::-webkit-slider-thumb]:hover:bg-passfort-vibrant"
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
