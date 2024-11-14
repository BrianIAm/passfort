// Prevents additional console window on Windows in release, DO NOT REMOVE!!
mod encryption;
use encryption::{decrypt, encrypt, generate_master_password, constant_time_compare, generate_random_salt, generate_file_keys, derive_key};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .setup(|app| {
        if let Some(_window) = app.get_webview_window("main") {
            #[cfg(target_os = "macos")]
            unsafe {
                window.with_webview(|webview| {
                    webview.set_transparent(true);
                }).unwrap();
            }
        }
        Ok(())
    })
        .plugin(
            tauri_plugin_global_shortcut::Builder::new().build()
        )
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
            generate_master_password,
            constant_time_compare,
            generate_file_keys,
            derive_key,
            generate_random_salt
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
