use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use rand::{Rng, RngCore};
use sha2::Sha256;

/*
    This system takes a client password with a length between 8-64 characters (for convenience) and
    hashes it using PBKDF2 with SHA-256 to generate a 256-bit key. This key is then used to encrypt
    and decrypt data using AES-256 in Galois Counter Mode (GCM). The salt and nonce are randomly
    generated for each encryption operation and are stored alongside the encrypted data. The salt is
    used to generate the key and the nonce is used to generate the ciphertext. This ensures that the
    same password will generate different keys and the same plaintext will generate different
    ciphertexts. The key is never stored and is derived from the password every time the data is
    decrypted. This ensures that the key is not exposed to brute force attacks.
*/

// The salt is important because it ensures that the same password will generate different keys
const SALT_LENGTH: usize = 32;
// The nonce is important because it ensures that the same plaintext will generate different ciphertexts
const NONCE_LENGTH: usize = 12;
// The key length is 256 bits (32 bytes) because we are using AES-256
const KEY_LENGTH: usize = 32;

// Character ranges for generating random master passwords
const CHARACTER_RANGES: [(u8, u8); 4] = [
    (97, 123), // Lowercase
    (65, 91),  // Uppercase
    (48, 58),  // Numbers
    (33, 127), // Special characters
];

pub fn hex_decode(s: &str) -> Result<Vec<u8>, String> {
    (0..s.len())
        // HEX values can be expressed with 2 characters
        .step_by(2)
        // Parse each pair of characters as a u8
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).map_err(|e| e.to_string()))
        .collect()
}

// This function derives a key from a master password and a salt
// The salt should be randomly generated and stored alongside the encrypted data
// The key should be derived from the master password every time the data is decrypted
// This ensures that the key is not stored anywhere and is not exposed to brute force attacks
fn derive_key(master_password: &str, salt: &[u8]) -> [u8; KEY_LENGTH] {
    let mut key = [0u8; KEY_LENGTH];
    pbkdf2_hmac::<Sha256>(master_password.as_bytes(), salt, 100_000, &mut key);
    key
}

// Genereate a random master password for the client
#[tauri::command]
pub fn generate_master_password(length: Option<u8>, options: Option<u8>) -> String {
    // Determine the length of the master password
    // The user can give a desired length, but we ensure that
    let length = length.unwrap_or(8).max(8).min(64) as usize;
    // Determine the character ranges to be used in the master password
    // or use all character ranges by default
    let mut options = options.unwrap_or(0b1111);

    // If the user supplied no configuration options, use all character ranges
    if options == 0 {
        options = 0b1111;
    }

    let mut rng = rand::thread_rng();
    let mut bytes = vec![0u8; length];

    // Filter character ranges based on the provided options
    let char_ranges: Vec<(u8, u8)> = CHARACTER_RANGES.iter()
        .enumerate()
        .filter_map(|(i, &range)| {
            if options & (1 << i) != 0 { Some(range) } else { None }
        })
        .collect();

    // Generate a random byte array for the master password
    for i in 0..length {
        // Pick one of the allowed ranges at random
        let range = char_ranges[rng.gen_range(0..char_ranges.len())];
        bytes[i] = rng.gen_range(range.0..range.1);
    }
    
    // Return the generated password as a string
    String::from_utf8(bytes).unwrap()
}

#[tauri::command]
pub fn encrypt(data: String, master_password: String) -> Result<String, String> {
    let mut rng = rand::thread_rng();

    // Create a random salt to be used in the key derivation
    let mut salt = [0u8; SALT_LENGTH];
    rng.fill_bytes(&mut salt);

    // Derive a key from the master password and the salt
    let key = derive_key(&master_password, &salt);
    // Create a cipher from the key to encrypt the data
    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Failed to create cipher: {}", e))?;

    // Create a random nonce to be used in the encryption
    let mut nonce = [0u8; NONCE_LENGTH];
    rng.fill_bytes(&mut nonce);
    let nonce = Nonce::from_slice(&nonce);

    // Encrypt the data using the cipher and the nonce
    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Combine the salt, nonce, and ciphertext into a single byte array
    let mut encrypted_bytes = Vec::with_capacity(SALT_LENGTH + NONCE_LENGTH + ciphertext.len());
    encrypted_bytes.extend_from_slice(&salt);
    encrypted_bytes.extend_from_slice(nonce.as_ref());
    encrypted_bytes.extend_from_slice(&ciphertext);

    // Encode the encrypted data as a hexadecimal string
    Ok(String::from_utf8(encrypted_bytes).unwrap())
}

#[tauri::command]
pub fn decrypt(encrypted_data: String, master_password: String) -> Result<String, String> {
    // Decode the encrypted data from a hexadecimal string to a byte array
    let encrypted_bytes =
        hex_decode(&encrypted_data).map_err(|e| format!("Invalid encrypted data: {}", e))?;

    // Ensure that the encrypted data is long enough to contain the salt, nonce, and ciphertext
    if encrypted_bytes.len() < SALT_LENGTH + NONCE_LENGTH {
        return Err("Encrypted data is too short".to_string());
    }

    // Split the encrypted data into the salt, nonce, and ciphertext
    let (salt, rest) = encrypted_bytes.split_at(SALT_LENGTH);
    let (nonce, ciphertext) = rest.split_at(NONCE_LENGTH);

    // Decode the salt, nonce, and ciphertext from hexadecimal strings to byte arrays
    let key = derive_key(&master_password, salt);
    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Failed to create cipher: {}", e))?;

    let nonce = Nonce::from_slice(nonce);

    // Decrypt the data using the cipher and the nonce
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("Invalid UTF-8 in decrypted data: {}", e))
}
