export interface Password {
    name: string;
    value: string;
    // This will often be an email or username
    associated_identifier?: string;
    last_updated: number;
}
