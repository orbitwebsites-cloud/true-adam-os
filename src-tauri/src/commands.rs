use std::process::Command;

/// Opens a URL in the user's default browser.
#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    open::that(url).map_err(|e| e.to_string())
}

/// Launches a local desktop app. Only a fixed, known-safe set of targets is
/// allowed — this receives text derived from chat input, so it must never
/// spawn an arbitrary process name.
#[tauri::command]
pub fn open_app(target: String) -> Result<(), String> {
    let program = match target.to_lowercase().as_str() {
        "notepad" => "notepad.exe",
        "calculator" | "calc" => "calc.exe",
        "explorer" | "files" | "file explorer" => "explorer.exe",
        "paint" => "mspaint.exe",
        "terminal" | "cmd" | "command prompt" => "cmd.exe",
        _ => return Err(format!("Unknown app: {target}")),
    };

    Command::new(program)
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}
