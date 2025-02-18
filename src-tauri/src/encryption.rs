use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use rand::seq::SliceRandom;
use rand::{Rng, RngCore};
use sha2::Sha256;

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use hmac::{Hmac, Mac};

type HmacSha256 = Hmac<Sha256>;

// The salt is important because it ensures that the same password will generate different keys
const SALT_LENGTH: usize = 32;
// The nonce is important because it ensures that the same plaintext will generate different ciphertexts
const NONCE_LENGTH: usize = 12;
// The key length is 256 bits (32 bytes) because we are using AES-256
const KEY_LENGTH: usize = 32;
const ITERATIONS: u32 = 100_000;

#[derive(serde::Serialize)]
pub struct FileKeys {
    passwords: String,
    verification: String,
}

// Character ranges for generating random master passwords
const CHARACTER_RANGES: [(u8, u8); 4] = [
    (b'a', b'z' + 1), // Lowercase
    (b'A', b'Z' + 1), // Uppercase
    (b'0', b'9' + 1), // Numbers
    (b'!', b'/' + 1), // Symbols (basic set)
];

#[tauri::command]
// Change derive_key to return bytes directly
pub fn derive_key(
    password: String,
    salt: &str,
    iterations: u32,
) -> Result<[u8; KEY_LENGTH], String> {
    let salt_bytes = hex::decode(salt).map_err(|_| "Invalid salt".to_string())?;

    let mut key = [0u8; KEY_LENGTH];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), &salt_bytes, iterations, &mut key);

    Ok(key)
}

#[tauri::command]
pub fn encrypt(data: String, master_password: String) -> Result<String, String> {
    if data.is_empty() || master_password.is_empty() {
        return Err("Invalid input data".to_string());
    }

    let mut rng = rand::thread_rng();

    // Generate salt
    let mut salt = [0u8; SALT_LENGTH];
    rng.try_fill_bytes(&mut salt).map_err(|e| e.to_string())?;
    let salt_hex = hex::encode(&salt); // Store salt_hex for key derivation

    // Derive key using the hex-encoded salt
    let key = derive_key(master_password, &salt_hex, ITERATIONS)?;

    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Failed to create cipher: {}", e))?;

    let mut nonce = [0u8; NONCE_LENGTH];
    rng.try_fill_bytes(&mut nonce).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&nonce);

    let ciphertext = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Important: Use the original salt bytes, not the hex-encoded version
    let mut encrypted_bytes = Vec::with_capacity(SALT_LENGTH + NONCE_LENGTH + ciphertext.len());
    encrypted_bytes.extend_from_slice(&salt); // Use original salt bytes
    encrypted_bytes.extend_from_slice(nonce.as_slice());
    encrypted_bytes.extend_from_slice(&ciphertext);

    Ok(hex::encode(encrypted_bytes))
}

#[tauri::command]
pub fn decrypt(encrypted_data: String, master_password: String) -> Result<String, String> {
    if encrypted_data.is_empty() || master_password.is_empty() {
        return Err("Invalid input data".to_string());
    }

    // Decode the encrypted data from a hexadecimal string to a byte array
    let encrypted_bytes =
        hex::decode(&encrypted_data).map_err(|e| format!("Invalid encrypted data: {}", e))?;

    // Ensure that the encrypted data is long enough to contain the salt, nonce, and ciphertext
    if encrypted_bytes.len() < SALT_LENGTH + NONCE_LENGTH {
        return Err("Encrypted data is too short".to_string());
    }

    // Split the encrypted data into the salt, nonce, and ciphertext
    let (salt, rest) = encrypted_bytes.split_at(SALT_LENGTH);
    let (nonce, ciphertext) = rest.split_at(NONCE_LENGTH);

    // Important: Use the salt bytes directly instead of hex encoding them again
    let key = derive_key(master_password, &hex::encode(salt), ITERATIONS)?;

    // Validation checks after key derivation
    if key.len() != KEY_LENGTH {
        return Err("Invalid key length".to_string());
    } else if nonce.len() != NONCE_LENGTH {
        return Err("Invalid nonce length".to_string());
    } else if salt.len() != SALT_LENGTH {
        return Err("Invalid salt length".to_string());
    }

    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("Failed to create cipher: {}", e))?;

    let nonce = Nonce::from_slice(nonce);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("Invalid UTF-8 in decrypted data: {}", e))
}

// Genereate a random password for the client
#[tauri::command]
pub fn generate_password(length: Option<u16>, configuration: Option<u8>) -> String {
    let length = length.unwrap_or(8).max(8).min(256) as usize;
    let options = configuration.unwrap_or(0b1111);

    let mut rng = rand::thread_rng();
    let mut password = Vec::with_capacity(length);

    // Ensure at least one character from each selected range
    for (i, &(start, end)) in CHARACTER_RANGES.iter().enumerate() {
        if options & (1 << i) != 0 {
            let random_char = rng.gen_range(start..end) as char;
            password.push(random_char);
        }
    }

    // Fill the rest of the password length with random characters from selected ranges
    let selected_ranges: Vec<(u8, u8)> = CHARACTER_RANGES
        .iter()
        .enumerate()
        .filter_map(|(i, &range)| {
            if options & (1 << i) != 0 {
                Some(range)
            } else {
                None
            }
        })
        .collect();

    while password.len() < length {
        let &(start, end) = selected_ranges.choose(&mut rng).unwrap();
        let random_char = rng.gen_range(start..end) as char;
        password.push(random_char);
    }

    // Shuffle the password to avoid predictable patterns
    password.shuffle(&mut rng);
    password.into_iter().collect()
}

#[tauri::command]
pub fn generate_random_salt() -> String {
    let mut salt = [0u8; SALT_LENGTH];
    let mut rng = rand::thread_rng();
    rng.fill_bytes(&mut salt);
    hex::encode(salt)
}

#[tauri::command]
pub fn constant_time_compare(a: String, b: String) -> bool {
    // Compare the two strings in constant time using XOR
    a.len() == b.len()
        && a.as_bytes()
            .iter()
            .zip(b.as_bytes().iter())
            .fold(0, |acc, (x, y)| acc | (x ^ y))
            == 0
}

#[tauri::command]
pub fn generate_file_keys(app_key: String, version: String) -> FileKeys {
    // Create HMAC instance for file name generation
    let mut mac = <HmacSha256 as KeyInit>::new_from_slice(app_key.as_bytes())
        .expect("HMAC initialization failed");

    // Generate passwords file name
    mac.update(b"passwords");
    mac.update(version.as_bytes());
    let passwords = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());

    // Reset HMAC for verification file name
    let mut mac = <HmacSha256 as KeyInit>::new_from_slice(app_key.as_bytes())
        .expect("HMAC initialization failed");

    mac.update(b"verification");
    mac.update(version.as_bytes());
    let verification = URL_SAFE_NO_PAD.encode(mac.finalize().into_bytes());

    FileKeys {
        passwords,
        verification,
    }
}
