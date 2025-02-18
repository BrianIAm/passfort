import { invoke } from '@tauri-apps/api/core';
import { createMasterPasswordVerification } from '#/lib/encrypt';
import { getVersion } from '@tauri-apps/api/app';
import type { Password } from '#/types/password';

import {
    writeFile,
    readFile,
    readDir as readDirectory,
    remove as removeFile,
    mkdir as createDirectory,
    BaseDirectory,
    exists,
} from '@tauri-apps/plugin-fs';

// App-specific constant that servers as root key
const APP_KEY = 'PassFort_v';

interface FileKeys {
    passwords: string;
    verification: string;
}

// Cache the file names to avoid recalculation
let fileNames: FileKeys | null = null;

function toBinary(data: string): Uint8Array {
    return new TextEncoder().encode(data);
}

function fromBinary(data: Uint8Array): string {
    return new TextDecoder().decode(data);
}

async function generateFileNames(): Promise<FileKeys> {
    // Derive deterministic but secure filenames using HMAC
    const keys = await invoke<FileKeys>('generate_file_keys', {
        appKey: APP_KEY,
        // For future migrations
        version: await getVersion(),
    });

    return keys;
}

async function getFileNames(): Promise<FileKeys> {
    if (!fileNames) {
        fileNames = await generateFileNames();
    }
    return fileNames;
}

async function ensureAppDataDirectoryExists() {
    const appDataExists = await exists('', { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
        await createDirectory('', { baseDir: BaseDirectory.AppData, recursive: true });
    }
}

export async function hasMasterPasswordVerification(): Promise<boolean> {
    const { verification } = await getFileNames();
    return exists(`${verification}.bin`, { baseDir: BaseDirectory.AppData });
}

export async function getStoredPasswords(): Promise<Password[]> {
    await ensureAppDataDirectoryExists();
    const { passwords } = await getFileNames();

    const fileExists = await exists(`${passwords}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return [];

    const buffer = await readFile(`${passwords}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    return JSON.parse(fromBinary(buffer)) as Password[];
}

export async function setStoredPasswords(passwords: Password[]) {
    await ensureAppDataDirectoryExists();
    const { passwords: passwordsFileName } = await getFileNames();

    await writeFile(`${passwordsFileName}.bin`, toBinary(JSON.stringify(passwords)), {
        baseDir: BaseDirectory.AppData,
    });
}

export async function getMasterPasswordVerification(): Promise<string | null> {
    await ensureAppDataDirectoryExists();
    const { verification } = await getFileNames();

    const fileExists = await exists(`${verification}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return null;

    const buffer = await readFile(`${verification}.bin`, {
        baseDir: BaseDirectory.AppData,
    });

    return fromBinary(buffer);
}

export async function saveMasterPasswordVerification(masterPassword: string) {
    await ensureAppDataDirectoryExists();
    const { verification: verificationFileName } = await getFileNames();

    const verification = await createMasterPasswordVerification(masterPassword);
    const data = toBinary(verification);

    await writeFile(`${verificationFileName}.bin`, data, {
        baseDir: BaseDirectory.AppData,
    });
}

export async function deleteAllData() {
    try {
        const entries = await readDirectory('', { baseDir: BaseDirectory.AppData });

        for (const entry of entries) {
            await removeFile(entry.name, { baseDir: BaseDirectory.AppData });
        }
    } catch {}
}
