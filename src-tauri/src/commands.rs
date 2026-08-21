use std::process::Command;

use crate::app_discovery;

/// Opens a URL in the user's default browser.
#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
    open::that(url).map_err(|e| e.to_string())
}

fn launch_via_start(target: &str) -> Result<(), String> {
    Command::new("cmd")
        .args(["/C", "start", "", target])
        .spawn()
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Launches a local desktop app. Tries a small fixed list of common special
/// cases first (things like Settings that aren't a normal .exe), then falls
/// back to scanning the Start Menu + registry App Paths for a fuzzy name
/// match — this is what lets it launch anything actually installed, not
/// just a hand-maintained list.
#[tauri::command]
pub fn open_app(target: String) -> Result<(), String> {
    let key = target.to_lowercase();

    let fixed: Option<&str> = match key.as_str() {
        "notepad" => Some("notepad.exe"),
        "calculator" | "calc" => Some("calc.exe"),
        "explorer" | "files" | "file explorer" => Some("explorer.exe"),
        "paint" => Some("mspaint.exe"),
        "terminal" | "cmd" | "command prompt" => Some("cmd.exe"),
        "task manager" => Some("taskmgr.exe"),
        "settings" => Some("ms-settings:"),
        _ => None,
    };

    if let Some(start_target) = fixed {
        return launch_via_start(start_target);
    }

    if let Some(start_target) = app_discovery::find_best_match(&target) {
        return launch_via_start(&start_target);
    }

    Err(format!("Couldn't find an installed app matching '{target}'"))
}
