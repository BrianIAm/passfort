export interface Password {
    name: string;
    value: string;
    // This will often be an email or username
    associated_identifier?: string;
    created_at: number;
    updated_at: number;
}
