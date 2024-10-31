import { invoke } from "@tauri-apps/api/core";

/**
 * These are bindings for the rust backend commands.
 */

export async function encrypt(
    data: string,
    masterPassword: string
): Promise<string> {
    return await invoke("encrypt", { data, masterPassword });
}

export async function decrypt(
    encryptedData: string,
    masterPassword: string
): Promise<string> {
    return await invoke("decrypt", { encryptedData, masterPassword });
}

export async function generateMasterPassword(
    length: number | null,
    options: number | null
): Promise<string> {
    return await invoke("generate_master_password", { length, options });
}
