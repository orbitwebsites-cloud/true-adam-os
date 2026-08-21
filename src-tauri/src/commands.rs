use std::process::Command;

/// Opens a URL in the user's default browser.
#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    open::that(url).map_err(|e| e.to_string())
}

/// Launches a local desktop app. Only a fixed, known-safe set of targets is
/// allowed — this receives text derived from chat input, so it must never
/// spawn an arbitrary process name. Uses the shell's `start` verb so Windows
/// resolves the target via the App Paths registry (works even if the app
/// isn't on PATH, which is the common case for installed GUI apps).
#[tauri::command]
pub fn open_app(target: String) -> Result<(), String> {
    let key = target.to_lowercase();
    let start_target: &str = match key.as_str() {
        "notepad" => "notepad.exe",
        "calculator" | "calc" => "calc.exe",
        "explorer" | "files" | "file explorer" => "explorer.exe",
        "paint" => "mspaint.exe",
        "terminal" | "cmd" | "command prompt" => "cmd.exe",
        "task manager" => "taskmgr.exe",
        "settings" => "ms-settings:",
        "firefox" | "mozilla firefox" | "ff" => "firefox.exe",
        "chrome" | "google chrome" => "chrome.exe",
        "edge" | "microsoft edge" => "msedge.exe",
        "spotify" => "spotify.exe",
        "discord" => "Discord.exe",
        "slack" => "slack.exe",
        "vscode" | "vs code" | "visual studio code" | "code" => "Code.exe",
        "word" | "microsoft word" => "winword.exe",
        "excel" | "microsoft excel" => "excel.exe",
        "powerpoint" => "powerpnt.exe",
        "steam" => "steam.exe",
        "whatsapp" => "WhatsApp.exe",
        "telegram" => "Telegram.exe",
        "zoom" => "Zoom.exe",
        _ => return Err(format!("Unknown app: {target}")),
    };

    Command::new("cmd")
        .args(["/C", "start", "", start_target])
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}
