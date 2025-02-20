type Password = {
    name: string;
    value: string;
    // This will often be an email or a username
    associated_identifier?: string;
    // The version of PassFort that created this password
    readonly version: string;
    readonly created_at: number;
    updated_at: number;
};
