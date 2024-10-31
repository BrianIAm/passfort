import {
    writeFile,
    readFile,
    mkdir,
    BaseDirectory,
    exists,
} from "@tauri-apps/plugin-fs";

import { type Password } from "#/types/password";

const KEYS_FILE = "5b35d5cc-d9b4-4e08-8cd7-b27daf96fdc6.bin";

async function ensureAppDataDirectoryExists() {
    const appDataExists = await exists("", { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
    }
}

export async function getStoredPasswords(): Promise<Password[]> {
    await ensureAppDataDirectoryExists();

    const fileExists = await exists(KEYS_FILE, {
        baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) return [];

    const buffer = await readFile(KEYS_FILE, {
        baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(new TextDecoder().decode(buffer)) as Password[];
}

export async function setStoredPasswords(passwords: Password[]) {
    await ensureAppDataDirectoryExists();

    const data = new TextEncoder().encode(JSON.stringify(passwords));
    await writeFile(KEYS_FILE, data, {
        baseDir: BaseDirectory.AppData,
    });
}
