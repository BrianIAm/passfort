export const PasswordOptionBits = {
    // Basic character sets
    LOWERCASE: 1 << 0,
    UPPERCASE: 1 << 1,
    NUMBERS: 1 << 2,
    SYMBOLS_BASIC: 1 << 3,
    SYMBOLS_EXTRA: 1 << 4,

    // Convenience combinations
    get LETTERS() {
        return this.LOWERCASE | this.UPPERCASE;
    },
    get ALPHANUMERIC() {
        return this.LETTERS | this.NUMBERS;
    },
    get SYMBOLS_ALL() {
        return this.SYMBOLS_BASIC | this.SYMBOLS_EXTRA;
    },
    get ALL() {
        return this.ALPHANUMERIC | this.SYMBOLS_ALL;
    },
} as const;

export type PasswordOptionKey = keyof typeof PasswordOptionBits;
export type PasswordOptionValue = (typeof PasswordOptionBits)[PasswordOptionKey];

export const PasswordOptionsHelpers = {
    // Check if a specific option is enabled in the bitfield
    isOptionEnabled(options: number, option: PasswordOptionKey): boolean {
        return (options & PasswordOptionBits[option]) === PasswordOptionBits[option];
    },

    // Toggle a specific option in the bitfield
    toggleOption(options: number, option: PasswordOptionKey): number {
        return options ^ PasswordOptionBits[option];
    },

    // Add a specific option to the bitfield
    addOption(options: number, option: PasswordOptionKey): number {
        return options | PasswordOptionBits[option];
    },

    // Remove a specific option from the bitfield
    removeOption(options: number, option: PasswordOptionKey): number {
        return options & ~PasswordOptionBits[option];
    },
};
