'use client';

import React, { useEffect, useState } from 'react';
import { writeText as writeTextToClipboard } from '@tauri-apps/plugin-clipboard-manager';
import { generatePassword } from '#/lib/encrypt';
import { useForm } from '@tanstack/react-form';

import {
    PasswordOptionBits,
    PasswordOptionsHelpers,
    type PasswordOptionKey,
    type PasswordOptionValue,
} from '#/types/passwords';

import { CopyIcon, GenerateIcon, ShapesIcon } from '#/icons';

const GENERATOR_OPTIONS: {
    id: PasswordOptionKey;
    label: string;
    range: string;
    bit: PasswordOptionValue;
}[] = [
    // Label, Range, Bit value
    { id: 'LOWERCASE', label: 'Lowercase', range: 'a-z', bit: PasswordOptionBits.LOWERCASE },
    { id: 'UPPERCASE', label: 'Uppercase', range: 'A-Z', bit: PasswordOptionBits.UPPERCASE },
    { id: 'NUMBERS', label: 'Numbers', range: '0-9', bit: PasswordOptionBits.NUMBERS },
    {
        id: 'SYMBOLS_BASIC',
        label: 'Common Symbols',
        range: '!@#$%&_-',
        bit: PasswordOptionBits.SYMBOLS_BASIC,
    },
    {
        id: 'SYMBOLS_EXTRA',
        label: 'Rare Symbols',
        range: '*^+=?.,|~(){}[]\\:;<>/',
        bit: PasswordOptionBits.SYMBOLS_EXTRA,
    },
];

export function PasswordGenerator() {
    const [changedOptions, setChangedOptions] = useState(false);

    const form = useForm({
        defaultValues: {
            password: '',
            password_length: 32,
            password_options: PasswordOptionBits.ALPHANUMERIC | PasswordOptionBits.SYMBOLS_BASIC,
        },
    });

    const handleGenerateNewPassword = async () => {
        const password = await generatePassword(
            form.getFieldValue('password_length'),
            form.getFieldValue('password_options')
        );

        // Update the password value
        form.setFieldValue('password', password);
        setChangedOptions(false);
        return password;
    };

    // Generate a new password on component mount
    useEffect(() => {
        if (form.state.values.password == '') {
            handleGenerateNewPassword();
        }
    }, [form.state.values]);

    return (
        <form
            className="border border-passfort-500 bg-passfort-900/25 rounded-lg p-6 mb-8"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
        >
            <div className="flex items-center mb-4">
                <ShapesIcon className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold text-white">Password Generator</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Checkboxes */}
                <form.Field
                    name="password_options"
                    children={(field: {
                        state: { value: number };
                        setValue: (value: number) => void;
                    }) => (
                        <OptionCheckBoxes
                            bitfield={field.state.value}
                            updateBitfield={(bitfield: number) => {
                                field.setValue(
                                    bitfield ||
                                        PasswordOptionBits.ALPHANUMERIC &
                                            PasswordOptionBits.SYMBOLS_BASIC
                                );
                                setChangedOptions(true);
                            }}
                        />
                    )}
                />

                {/* Length range slider */}
                <form.Field
                    name="password_length"
                    children={(field: {
                        state: { value: number };
                        setValue: (value: number) => void;
                    }) => (
                        <LengthSlider
                            length={field.state.value}
                            onChange={(newLength: number) => {
                                field.setValue(newLength);
                                setChangedOptions(true);
                            }}
                        />
                    )}
                />
            </div>

            {/* Password read-only textfield */}
            <PasswordDisplay
                password={form.getFieldValue('password')}
                changedOptions={changedOptions}
                handleGenerateNewPassword={handleGenerateNewPassword}
            />
        </form>
    );
}

function OptionCheckBoxes({
    bitfield,
    updateBitfield,
}: {
    bitfield: number;
    updateBitfield: (bits: number) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-4">
                <span className="block font-bold text-white underline decoration-2 decoration-passfort-500">
                    Password Options
                </span>
            </div>

            {GENERATOR_OPTIONS.map((option) => (
                <label key={option.id} className="flex group">
                    <input
                        id={option.id}
                        type="checkbox"
                        className="sr-only peer"
                        checked={PasswordOptionsHelpers.isOptionEnabled(bitfield, option.id)}
                        onChange={(e) => {
                            const updatedBitfield = PasswordOptionsHelpers[
                                e.target.checked ? 'addOption' : 'removeOption'
                            ](bitfield, option.id);

                            updateBitfield(updatedBitfield);
                        }}
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

                    <div className="inline-flex gap-2">
                        <p className="text-white">{option.label}</p>
                        <span className="text-passfort-500">
                            (<b className="text-white font-bold text-sm">{option.range}</b>)
                        </span>
                    </div>
                </label>
            ))}
        </div>
    );
}

function LengthSlider({
    length,
    onChange,
}: {
    length: number;
    onChange: (newLength: number) => void;
}) {
    return (
        <div>
            <div className="text-center">
                <span className="font-bold text-white underline decoration-2 decoration-red-500">
                    {length}
                </span>{' '}
                <span className="font-bold text-red-500">characters</span>
            </div>

            <input
                type="range"
                min={8}
                max={256}
                step={8}
                value={length}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    onChange(value);
                }}
                className="range w-full h-2 rounded-lg appearance-none bg-passfort-500/10 accent-passfort-500 cursor-pointer [&::-webkit-slider-thumb]:bg-passfort-500! [&::-webkit-slider-thumb]:hover:bg-passfort-500"
            />

            <div className="flex justify-between text-sm text-passfort-500 font-bold mt-2">
                <span>8</span>
                <span>256</span>
            </div>
        </div>
    );
}

function PasswordDisplay({
    password,
    changedOptions,
    handleGenerateNewPassword,
}: {
    password: string;
    changedOptions: boolean;
    handleGenerateNewPassword: () => void;
}) {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        writeTextToClipboard(password);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="relative">
            <div
                className={`flex items-center h-12 px-2 py-2 rounded-lg border ${
                    copySuccess
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-passfort-500 bg-passfort-500/10'
                }`}
            >
                <input
                    readOnly
                    type="text"
                    className="flex-1 bg-transparent border-none text-lg font-mono focus:ring-0 focus:outline-none"
                    value={
                        copySuccess
                            ? 'Copied!'
                            : password.substring(0, 88) + (password.length > 88 ? '...' : '')
                    }
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateNewPassword}
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
                </div>
            </div>
        </div>
    );
}
