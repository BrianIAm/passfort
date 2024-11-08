import { invoke } from "@tauri-apps/api/core";
import { getMasterPasswordVerification } from "#/lib/fs";

/**
 * These are bindings for the rust backend commands.
 */

interface VerificationHash {
    salt: string;
    hash: string;
    iterations: number;
}

export async function encrypt(
    data: string,
    masterPassword: string
): Promise<string> {
    try {
        const result = await Promise.race([
            invoke("encrypt", { data, masterPassword }),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Encryption timed out")),
                    5000
                )
            ),
        ]);
        return result as string;
    } catch (error) {
        console.error("Encryption failed:", error);
        throw error;
    }
}

export async function decrypt(
    encryptedData: string,
    masterPassword: string
): Promise<string> {
    try {
        const result = await Promise.race([
            invoke("decrypt", { encryptedData, masterPassword }),
            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("Decryption timed out")),
                    5000
                )
            ),
        ]);
        return result as string;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw error;
    }
}

export async function generateMasterPassword(
    length: number | null,
    configuration: number | null
): Promise<string> {
    return await invoke<string>("generate_master_password", {
        length,
        configuration,
    });
}

export async function createMasterPasswordVerification(
    masterPassword: string
): Promise<string> {
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
}

async function generateVerificationHash(
    masterPassword: string,
    iterations: number
): Promise<VerificationHash> {
    // Generate a unique salt for each verification
    const salt = await invoke<string>("generate_random_salt", {});

    // Create hash using PBKDF2 with different iteration counts
    const key = await invoke<number[]>("derive_key", {
        password: masterPassword,
        salt,
        iterations,
    });

    // Convert array to hex string if needed
    const hash = Buffer.from(key).toString("hex");

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
                const testHash = await invoke<string>("derive_key", {
                    password,
                    salt: v.salt,
                    iterations: v.iterations,
                });

                // Time-constant comparison to prevent timing attacks
                return await invoke<boolean>("constant_time_compare", {
                    a: testHash,
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
