// Prevents additional console window on Windows in release, DO NOT REMOVE!!
mod encryption;
use encryption::{
    constant_time_compare, decrypt, derive_key, encrypt, generate_file_keys, generate_password,
    generate_random_salt,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        // .plugin(tauri_plugin_http::init())
        // .plugin(tauri_plugin_dialog::init())
        // .plugin(tauri_plugin_notification::init())
        // .plugin(tauri_plugin_process::init())
        // .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            encrypt,
            decrypt,
            generate_password,
            constant_time_compare,
            generate_file_keys,
            derive_key,
            generate_random_salt
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
