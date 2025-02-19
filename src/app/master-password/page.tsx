'use client';
import { encrypt, decrypt, verifyMasterPassword } from '#/lib/encrypt';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import {
    getStoredPasswords,
    setStoredPasswords,
    hasMasterPasswordVerification,
    saveMasterPasswordVerification,
} from '#/lib/fs';

import { ShieldIcon, CopyIcon, ExclamationIcon, KeysIcon, InfoIcon } from '#/icons';

export default function Page() {
    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Master Password</h2>
                    <p className="text-red-500 mt-2">Generate and manage your master password</p>
                </div>
            </div>

            {/* Master Password Warning */}
            <div className="p-6 rounded-lg border border-red-500 bg-red-500/10 mb-8">
                <div className="flex items-center mb-2">
                    <ExclamationIcon className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold text-white">Warning!</h3>
                </div>

                <div className="space-y-4 text-red-400">
                    <p>
                        If you forget or lose your master password,{' '}
                        <u className="text-white font-bold underline decoration-red-400 decoration-2">
                            there is no way to recover your stored passwords.
                        </u>{' '}
                        Such is the price of security.
                    </p>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-6 rounded-lg border border-red-500 bg-red-500/10 mb-8">
                <div className="flex items-center mb-2">
                    <ShieldIcon className="w-6 h-6 mr-2" />
                    <h3 className="text-xl font-bold">Important Security Notice</h3>
                </div>

                <div className="space-y-4 text-red-400">
                    <p>
                        Your master password is the key to all your stored passwords. Make sure to:
                    </p>

                    <ul className="list-disc list-inside space-y-2 ml-4 underline font-bold text-white decoration-2 decoration-red-400">
                        <li>Choose a strong, unique password</li>
                        <li>Store it securely offline</li>
                        <li>Never share it with anyone</li>
                        <li>Consider changing it periodically</li>
                    </ul>
                </div>
            </div>

            <CreateOrUpdateMasterPasswordForm />
        </main>
    );
}

type MasterPasswordForm = {
    previousMasterPassword?: string;
    newMasterPassword: string;
    newMasterPasswordConfirm: string;
};

function CreateOrUpdateMasterPasswordForm() {
    const router = useRouter();
    const [hasMasterPassword, setHasMasterPassword] = useState(false);
    const validPasswordRegex = /^\S{8,256}$/;

    const form = useForm<MasterPasswordForm>({
        defaultValues: {
            previousMasterPassword: '',
            newMasterPassword: '',
            newMasterPasswordConfirm: '',
        },
        onSubmit: async ({ value }) => {
            // If the user has not set a master password before...
            if (!hasMasterPassword) {
                // Save the master password verification and redirect to vault
                await saveMasterPasswordVerification(value.newMasterPassword);
                router.push('/');
                return;
            }

            // This should be handled by validators
            // but make sure we have a previous master password
            if (value.previousMasterPassword) {
                return;
            }

            // If the user had a previous master password
            // there may be passwords that need to be re-encrypted
            const passwords = await getStoredPasswords();
            const now = Date.now();

            // Re-encrypt them with the new master password
            const updatedPasswords = await Promise.all(
                passwords.map(async (password) => {
                    const decrypted = await decrypt(password.value, value.previousMasterPassword!);

                    if (!decrypted) {
                        throw new Error('Invalid previous master password');
                    }
                    const encrypted = await encrypt(decrypted, value.newMasterPassword);

                    return {
                        ...password,
                        value: encrypted,
                        last_updated: now,
                    };
                })
            );

            // Save the new passwords
            if (updatedPasswords.length) {
                await setStoredPasswords(updatedPasswords);
            }

            // Save the master password verification and redirect to vault
            await saveMasterPasswordVerification(value.newMasterPassword);
            router.push('/');
        },
    });

    const checkIsValidPassword = (password: string): string | null => {
        if (password.length < 8 || password.length > 256) {
            return 'Password must be between 8 and 256 characters';
        }

        if (!validPasswordRegex.test(password)) {
            return 'Password must not contain spaces';
        }

        return null;
    };

    // Check if the user has set a master password before
    useEffect(() => {
        hasMasterPasswordVerification().then((hasMasterPassword) => {
            setHasMasterPassword(hasMasterPassword);
        });
    }, []);

    return (
        <form
            className="flex flex-col gap-2 p-6 rounded-lg border border-red-500 bg-passfort/50 mb-8 space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
        >
            <div className="flex items-center mb-2">
                <KeysIcon className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-bold">
                    {hasMasterPassword ? 'Update' : 'Create'} Master Password
                </h3>
            </div>

            <p className="text-red-400">
                Don&apos;t have a password in mind? Use our{' '}
                <Link
                    href="/password-generator"
                    className="text-white font-bold underline decoration-red-400 decoration-2"
                >
                    password generator
                </Link>{' '}
                if you don&apos;t have a strong password ready to go.
            </p>

            {/* Previous Master Password Input */}
            {hasMasterPassword && (
                <form.Field
                    name="previousMasterPassword"
                    validators={{
                        onChangeAsyncDebounceMs: 500,
                        onChangeAsync: async ({ value }) => {
                            if (!value) {
                                return 'Your previous master password is required';
                            }

                            // Check if the previous master password is valid
                            const isValid = await verifyMasterPassword(value);
                            if (!isValid) {
                                return 'Your previous master password is incorrect';
                            }

                            return checkIsValidPassword(value);
                        },
                    }}
                >
                    {(field) => (
                        <div>
                            <label htmlFor={field.name} className="font-bold text-lg">
                                Previous Master Password
                            </label>

                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border-2 border-red-500 bg-red-500/10 placeholder:text-red-500/50 placeholder:italic focus:red-400 focus:outline-none focus:outline-red-500"
                                placeholder="Enter your previous master password"
                                type="password"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                minLength={8}
                                maxLength={256}
                            />

                            {/* Master Password change notice */}
                            <div className="bg-sky-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-sky-200">
                                <InfoIcon />
                                <span className="font-bold">
                                    Updating your master password will re-encode all of the
                                    passwords in your vault.
                                </span>
                            </div>

                            {field.state.meta.errors.length ? (
                                <div className="flex mt-2 items-center font-bold underline decoration-2 decoration-red-400">
                                    <ExclamationIcon className="w-6 h-6 mr-1 text-red-500" />
                                    <em>{field.state.meta.errors.join(',')}</em>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? 'Validating...' : null}
                        </div>
                    )}
                </form.Field>
            )}

            {/* New Master Password Input */}
            <form.Field
                name="newMasterPassword"
                validators={{
                    onChange: ({ value }) => {
                        if (
                            hasMasterPassword &&
                            value === form.getFieldValue('previousMasterPassword')
                        ) {
                            return 'New password cannot be the same as the previous password';
                        }

                        return checkIsValidPassword(value);
                    },
                }}
            >
                {(field) => (
                    <div>
                        <label htmlFor={field.name} className="font-bold text-lg">
                            New Master Password
                        </label>
                        <input
                            className="w-full text-white text-sm px-2 py-2 rounded-md border-2 border-red-500 bg-red-500/10 placeholder:text-red-500/50 placeholder:italic focus:red-400 focus:outline-none focus:outline-red-500"
                            placeholder="Enter your new master password"
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            minLength={8}
                            maxLength={256}
                        />

                        {field.state.meta.errors.length ? (
                            <div className="flex mt-2 items-center font-bold underline decoration-2 decoration-red-400">
                                <ExclamationIcon className="w-6 h-6 mr-1 text-red-500" />
                                <em>{field.state.meta.errors.join(',')}</em>
                            </div>
                        ) : null}

                        {field.state.meta.isValidating ? 'Validating...' : null}
                    </div>
                )}
            </form.Field>

            {/* New Master Password Confirm Input */}
            <form.Field
                name="newMasterPasswordConfirm"
                validators={{
                    onChange: ({ value }) => {
                        // Check if the passwords match
                        if (value !== form.getFieldValue('newMasterPassword')) {
                            return 'Passwords do not match';
                        }

                        // Make sure the new password has no erorrs
                        if (form.getFieldMeta('newMasterPassword')?.errors.length) {
                            return 'Please enter a valid password first';
                        }

                        return checkIsValidPassword(value);
                    },
                }}
            >
                {(field) => (
                    <div>
                        <label htmlFor={field.name} className="font-bold text-lg">
                            Confirm New Master Password
                        </label>
                        <input
                            className="w-full text-white text-sm px-2 py-2 rounded-md border-2 border-red-500 bg-red-500/10 placeholder:text-red-500/50 placeholder:italic focus:red-400 focus:outline-none focus:outline-red-500"
                            placeholder="Just to make sure..."
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            minLength={8}
                            maxLength={256}
                        />

                        {field.state.meta.isTouched && field.state.meta.errors.length ? (
                            <div className="flex mt-2 items-center font-bold underline decoration-2 decoration-red-400">
                                <ExclamationIcon className="w-6 h-6 mr-1 text-red-500" />
                                <em>{field.state.meta.errors.join(',')}</em>
                            </div>
                        ) : null}

                        {field.state.meta.isValidating ? 'Validating...' : null}
                    </div>
                )}
            </form.Field>

            {/* Submit Button */}
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <button
                        className="w-min text-nowrap px-4 py-2 rounded-lg text-white font-semibold bg-red-500 transition-colors disabled:opacity-50 hover:bg-red-500"
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                    >
                        {isSubmitting
                            ? 'Submitting...'
                            : `${hasMasterPassword ? 'Update' : 'Create'} Master Password`}
                    </button>
                )}
            </form.Subscribe>
        </form>
    );
}
