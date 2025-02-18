import { invoke } from '@tauri-apps/api/core';
import { getMasterPasswordVerification, getStoredPasswords, setStoredPasswords } from '#/lib/fs';
import type { Password } from '#/types/password';

/**
 * These are bindings for the rust backend commands.
 */

interface VerificationHash {
    salt: string;
    hash: string;
    iterations: number;
}

export async function encrypt(data: string, masterPassword: string): Promise<string> {
    try {
        const result = await Promise.race([
            invoke('encrypt', { data, masterPassword }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Encryption timed out')), 5000)
            ),
        ]);
        return result as string;
    } catch (error) {
        // Very rarely this will error because of erroneous code
        // this error will happen most commonly when the master password
        // is incorrect
        // Same applies to the decrypt function
        throw error;
    }
}

export async function decrypt(encryptedData: string, masterPassword: string): Promise<string> {
    try {
        const result = await Promise.race([
            invoke('decrypt', { encryptedData, masterPassword }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Decryption timed out')), 5000)
            ),
        ]);
        return result as string;
    } catch (error) {
        throw error;
    }
}

export async function generatePassword(
    length: number | null,
    configuration: number | null
): Promise<string> {
    return invoke<string>('generate_password', {
        length,
        configuration,
    });
}

export async function createMasterPasswordVerification(masterPassword: string): Promise<string> {
    try {
        // Create multiple verification tokens with different parameters
        const verifications: VerificationHash[] = await Promise.all([
            // Primary verification with high iteration count
            generateVerificationHash(masterPassword, 100_000),
            // Secondary verification with different parameters
            generateVerificationHash(masterPassword, 150_000),
            // Tertiary verification as failsafe
            generateVerificationHash(masterPassword, 200_000),
        ]);

        // Encrypt the verification data with the master password itself
        return await encrypt(JSON.stringify(verifications), masterPassword);
    } catch (error) {
        throw error;
    }
}

async function generateVerificationHash(
    masterPassword: string,
    iterations: number
): Promise<VerificationHash> {
    // Generate a unique salt for each verification
    const salt = await invoke<string>('generate_random_salt', {});

    // Create hash using PBKDF2. This returns a buffer
    const key = await invoke<number[]>('derive_key', {
        password: masterPassword,
        salt,
        iterations,
    });

    // Convert the key to a hex string
    const hash = Buffer.from(key).toString('hex');
    return { salt, hash, iterations };
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
    const encryptedVerification = await getMasterPasswordVerification();
    if (!encryptedVerification) return false;

    try {
        // First test: Can we decrypt the verification data?
        const verificationData = await decrypt(encryptedVerification, password);
        const verifications: VerificationHash[] = JSON.parse(verificationData);

        // Second test: Check all verification hashes
        // Uses Promise.all for concurrent verification but requires ALL to pass
        const results = await Promise.all(
            verifications.map(async (v) => {
                const testBuffer = await invoke<string>('derive_key', {
                    password,
                    salt: v.salt,
                    iterations: v.iterations,
                });

                // Time-constant comparison to prevent timing attacks
                return await invoke<boolean>('constant_time_compare', {
                    a: Buffer.from(testBuffer).toString('hex'),
                    b: v.hash,
                });
            })
        );

        // All verifications must pass
        return results.every((result) => result === true);
    } catch {
        return false;
    }
}

export async function changeMasterPassword(oldPassword: string, newPassword: string) {
    try {
        // Verify that the master password is correct
        const verified = await verifyMasterPassword(oldPassword);
        if (!verified) {
            throw new Error('Old password is incorrect');
        }

        // Get all of the passwords
        const passwords = await getStoredPasswords();
        const newPasswords: Password[] = [];

        // Iterate through all of the passwords
        // decrypting them with the old password
        // and encrypting them with the new one
        // Error if any decryption or encryption fails
        for (const password of passwords) {
            const decrypted = await decrypt(password.value, oldPassword);

            newPasswords.push({
                ...password,
                value: await encrypt(decrypted, newPassword),
                updated_at: Date.now(),
            });
        }

        // Create a new verification token with the new password
        // and save the new passwords
        await Promise.all([
            createMasterPasswordVerification(newPassword),
            setStoredPasswords(newPasswords),
        ]);
    } catch (error) {
        throw error;
    }
}
