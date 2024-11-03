import {
    writeFile,
    readFile,
    mkdir,
    BaseDirectory,
    exists,
} from "@tauri-apps/plugin-fs";

import { type Password } from "#/types/password";

enum FILES {
    // This is the key file that stores the passwords
    KEYS = "5b35d5cc-d9b4-4e08-8cd7-b27daf96fdc6",
    // This is the file that stores the confirm token
    // The confirm token is an encrypted string that resolves to
    // "passfort" when decrypted with the true master password
    CONFIRM_TOKEN = "6db690ca-2af2-411f-8ead-7bd8ed054335",
}

function toBinary(data: string): Uint8Array {
    return new TextEncoder().encode(data);
}

function fromBinary(data: Uint8Array): string {
    return new TextDecoder().decode(data);
}

async function ensureAppDataDirectoryExists() {
    const appDataExists = await exists("", { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
    }
}

export async function getStoredPasswords(): Promise<Password[]> {
    await ensureAppDataDirectoryExists();

    const fileExists = await exists(`${FILES.KEYS}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return [];

    const buffer = await readFile(`${FILES.KEYS}.bin`, {
        baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(fromBinary(buffer)) as Password[];
}

export async function setStoredPasswords(passwords: Password[]) {
    await ensureAppDataDirectoryExists();

    const data = toBinary(JSON.stringify(passwords));
    await writeFile(`${FILES.KEYS}.bin`, data, {
        baseDir: BaseDirectory.AppData,
    });
}

export async function getConfirmToken(): Promise<string | null> {
    await ensureAppDataDirectoryExists();

    const fileExists = await exists(`${FILES.CONFIRM_TOKEN}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return null;

    const buffer = await readFile(`${FILES.CONFIRM_TOKEN}.bin`, {
        baseDir: BaseDirectory.AppData,
    });
    return fromBinary(buffer);
}

export async function setConfirmToken(token: string) {
    await ensureAppDataDirectoryExists();

    const data = toBinary(token);
    await writeFile(`${FILES.CONFIRM_TOKEN}.bin`, data, {
        baseDir: BaseDirectory.AppData,
    });
}
