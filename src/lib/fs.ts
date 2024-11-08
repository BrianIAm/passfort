import {
    writeFile,
    readFile,
    mkdir,
    BaseDirectory,
    exists,
} from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

import { type Password } from "#/types/password";
import { createMasterPasswordVerification } from "#/lib/encrypt";

// App-specific constant that servers as root key
const APP_KEY = "PassFort_v1.0";

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
    const keys = await invoke<FileKeys>("generate_file_keys", {
        appKey: APP_KEY,
        version: "1", // For future migrations
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
    const appDataExists = await exists("", { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
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

    await writeFile(
        `${passwordsFileName}.bin`,
        toBinary(JSON.stringify(passwords)),
        {
            baseDir: BaseDirectory.AppData,
        }
    );
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
    console.log("Saving master password verification");
    await ensureAppDataDirectoryExists();
    console.log("Ensured app data directory exists");
    const { verification: verificationFileName } = await getFileNames();

    console.log("Got file names");
    const verification = await createMasterPasswordVerification(masterPassword);
    console.log("Created verification");
    const data = toBinary(verification);

    await writeFile(`${verificationFileName}.bin`, data, {
        baseDir: BaseDirectory.AppData,
    });

    console.log("Wrote verification to file");
}
