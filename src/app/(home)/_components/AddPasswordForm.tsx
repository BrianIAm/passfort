import { addPassword, hasMasterPasswordVerification } from '#/lib/fs';
import { Dialog } from '#/components/Dialog';
import { encrypt, verifyMasterPassword } from '#/lib/encrypt';
import { getVersion } from '@tauri-apps/api/app';
import { useForm } from '@tanstack/react-form';

import { LockIcon, ExclamationIcon, ShieldIcon } from '#/icons';

export default function Component({
    setIsModalShowing,
}: {
    setIsModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const form = useForm({
        defaultValues: {
            name: '',
            associated_identifier: '',
            value: '',
            master_password: '',
            password_confirm: '',
        },
        onSubmit: async ({ value }) => {
            const { master_password, password_confirm, ...passwordFormFields } = value;

            if (passwordFormFields.value !== password_confirm) {
                return;
            }

            // Encrypt the password using the master password
            const encryptedPasswordValue = await encrypt(passwordFormFields.value, master_password);

            // Create the password object
            const encryptedPassword: Password = {
                ...passwordFormFields,
                value: encryptedPasswordValue,
                created_at: Date.now(),
                updated_at: Date.now(),
                version: await getVersion(),
            };

            await addPassword(encryptedPassword);
            setIsModalShowing(false);
        },
    });

    return (
        <Dialog onClose={() => setIsModalShowing(false)}>
            <form
                className="flex flex-col p-4 max-w-2xl gap-6"
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <div className="flex items-center">
                    <ShieldIcon className="w-8 h-8 mr-2 stroke-passfort-500 text-transparent" />
                    <h3 className="text-2xl font-bold">Add New Password</h3>
                </div>

                {/* Name */}
                <form.Field
                    name={'name'}
                    validators={{
                        onChange: ({ value }: { value: string }) => {
                            if (!value) {
                                return 'Name is required';
                            }

                            if (value.length < 3) {
                                return 'Name must be at least 3 characters long';
                            }

                            if (value.length > 50) {
                                return 'Name must be less than 50 characters long';
                            }

                            return null;
                        },
                    }}
                >
                    {(field) => (
                        <div className="inline-flex flex-col gap-2">
                            <label htmlFor={field.name}>Name</label>
                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border border-passfort-500 bg-none placeholder:text-gray-500 focus:outline-none focus:outline-2 autofill:bg-none"
                                placeholder="A name to differenciate this password by"
                                type="text"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                minLength={2}
                                maxLength={64}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />

                            {field.state.meta.errors.length ? (
                                <div className="w-max bg-red-500/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-red-100">
                                    <ExclamationIcon className="w-6 h-6 mr-1" />
                                    <span>{field.state.meta.errors.join(',')}</span>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? (
                                <div className="w-max bg-gray-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-gray-200">
                                    <LockIcon />
                                    <span>Validating...</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </form.Field>

                {/* Associated Identifier */}
                <form.Field name={'associated_identifier'}>
                    {(field) => (
                        <div className="inline-flex flex-col gap-2">
                            <label htmlFor={field.name}>Identifier</label>
                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border border-passfort-500 bg-none placeholder:text-gray-500 focus:outline-none focus:outline-2 autofill:bg-none"
                                placeholder="An email, username or website relevant to the password"
                                type="text"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                minLength={2}
                                maxLength={64}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />

                            {field.state.meta.errors.length ? (
                                <div className="w-max bg-red-500/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-red-100">
                                    <ExclamationIcon className="w-6 h-6 mr-1" />
                                    <span>{field.state.meta.errors.join(',')}</span>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? (
                                <div className="w-max bg-gray-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-gray-200">
                                    <LockIcon />
                                    <span>Validating...</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </form.Field>

                {/* Password */}
                <form.Field
                    name={'value'}
                    validators={{
                        onChange: ({ value }: { value: string }) => {
                            if (!value) {
                                return 'Password is required';
                            }

                            if (value.length < 8) {
                                return 'Password must be at least 8 characters long';
                            }

                            if (value.length > 256) {
                                return 'Password must be less than 256 characters long';
                            }

                            return null;
                        },
                    }}
                >
                    {(field) => (
                        <div className="inline-flex flex-col gap-2">
                            <label htmlFor={field.name}>Password</label>
                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border border-passfort-500 bg-none placeholder:text-gray-500 focus:outline-none focus:outline-2 autofill:bg-none"
                                placeholder="Your password"
                                type="password"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                minLength={8}
                                maxLength={256}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />

                            {field.state.meta.errors.length ? (
                                <div className="w-max bg-red-500/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-red-100">
                                    <ExclamationIcon className="w-6 h-6 mr-1" />
                                    <span>{field.state.meta.errors.join(',')}</span>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? (
                                <div className="w-max bg-gray-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-gray-200">
                                    <LockIcon />
                                    <span>Validating...</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </form.Field>

                {/* Confirm Password */}
                <form.Field
                    name={'password_confirm'}
                    validators={{
                        onChange: ({ value }: { value: string }) => {
                            if (!value) {
                                return 'Password confirmation is required';
                            }

                            if (value !== form.getFieldValue('value')) {
                                return 'Passwords do not match';
                            }

                            if (form.getFieldMeta('value')?.errors.length) {
                                return 'Please enter a valid password first';
                            }

                            return null;
                        },
                    }}
                >
                    {(field) => (
                        <div className="inline-flex flex-col gap-2">
                            <label htmlFor={field.name}>Confirm password</label>
                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border border-passfort-500 bg-none placeholder:text-gray-500 focus:outline-none focus:outline-2 autofill:bg-none"
                                placeholder="Just to make sure, confirm your password"
                                type="password"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                minLength={8}
                                maxLength={256}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />

                            {field.state.meta.errors.length ? (
                                <div className="w-max bg-red-500/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-red-100">
                                    <ExclamationIcon className="w-6 h-6 mr-1" />
                                    <span>{field.state.meta.errors.join(',')}</span>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? (
                                <div className="w-max bg-gray-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-gray-200">
                                    <LockIcon />
                                    <span>Validating...</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </form.Field>

                {/* Security Notice */}
                <div className="p-4 rounded-lg border border-passfort-500 bg-passfort-950">
                    <div className="flex font-bold mb-2">
                        <LockIcon className="w-6 h-6 mr-2 text-red-500" />
                        <h3 className="text-lg">Encode with Master Password</h3>
                        {!form.getFieldMeta('master_password')?.isPristine &&
                            (form.getFieldMeta('master_password')?.errors || []).length < 1 && (
                                <label className="ml-auto inline-flex bg-gren-500 items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        defaultChecked={true}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-passfort-500" />
                                </label>
                            )}
                    </div>
                    <p className="space-y-4 text-red-300 text-sm">
                        Use your master password to encode this password. PassFort does not store
                        your master password so you&apos;ll need to type it again.
                    </p>
                </div>

                {/* Master Password */}
                <form.Field
                    name={'master_password'}
                    validators={{
                        onChangeAsyncDebounceMs: 500,
                        onChangeAsync: async ({ value }: { value: string }) => {
                            if (!value) {
                                return 'Master password is required';
                            }

                            const isValid = await verifyMasterPassword(value);
                            if (!isValid) {
                                return 'Incorrect master password';
                            }

                            return null;
                        },
                    }}
                >
                    {(field) => (
                        <div className="inline-flex flex-col gap-2">
                            <label htmlFor={field.name}>Master Password</label>
                            <input
                                className="w-full text-white text-sm px-2 py-2 rounded-md border border-passfort-500 bg-none placeholder:text-gray-500 focus:outline-none focus:outline-2 autofill:bg-none"
                                placeholder="Your master password"
                                type="password"
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                            />

                            {field.state.meta.errors.length ? (
                                <div className="w-max bg-red-500/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-red-100">
                                    <ExclamationIcon className="w-6 h-6 mr-1" />
                                    <span>{field.state.meta.errors.join(',')}</span>
                                </div>
                            ) : null}

                            {field.state.meta.isValidating ? (
                                <div className="w-max bg-gray-600/25 pl-2 pr-4 py-2 rounded-lg inline-flex gap-1 items-center mt-4 text-sm text-gray-200">
                                    <LockIcon />
                                    <span>Validating...</span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </form.Field>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => setIsModalShowing(false)}
                        className="px-4 py-2 rounded-lg border border-passfort-500 hover:bg-passfort-500/15 transition-colors"
                    >
                        Cancel
                    </button>

                    {/* Submit Button */}
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <button
                                className="w-min text-nowrap px-4 py-2 rounded-lg text-white font-semibold bg-passfort-500 transition-colors disabled:opacity-50 disabled:grayscale-100 hover:bg-passfort-500"
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Add Password'}
                            </button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Dialog>
    );
}
