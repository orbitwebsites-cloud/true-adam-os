//! Dynamic discovery of installed desktop apps, so "open X" can match
//! anything actually installed instead of a fixed hand-maintained list.
//!
//! Two sources, merged:
//! - Start Menu shortcuts (.lnk files) under the per-machine and per-user
//!   Programs folders — covers almost everything with a Start Menu entry.
//! - The registry's "App Paths" key — covers apps registered for `start`
//!   resolution even without a visible Start Menu shortcut.

use std::path::PathBuf;

#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::RegKey;

pub struct AppEntry {
    pub name: String,
    /// Something `cmd /C start "" <target>` can open directly: either a
    /// full path to a .lnk shortcut, or a bare "name.exe" that Windows
    /// resolves via the App Paths registry.
    pub target: String,
}

#[cfg(windows)]
fn scan_start_menu_dir(dir: PathBuf, out: &mut Vec<AppEntry>) {
    if !dir.exists() {
        return;
    }
    for entry in walkdir::WalkDir::new(dir)
        .max_depth(4)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("lnk") {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                out.push(AppEntry {
                    name: stem.to_string(),
                    target: path.to_string_lossy().to_string(),
                });
            }
        }
    }
}

#[cfg(windows)]
fn scan_app_paths(hive: RegKey, out: &mut Vec<AppEntry>) {
    let Ok(app_paths) =
        hive.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths")
    else {
        return;
    };

    for key_name in app_paths.enum_keys().filter_map(|k| k.ok()) {
        let name = key_name.trim_end_matches(".exe").to_string();
        out.push(AppEntry {
            name,
            target: key_name,
        });
    }
}

#[cfg(windows)]
pub fn discover() -> Vec<AppEntry> {
    let mut apps = Vec::new();

    if let Ok(program_data) = std::env::var("PROGRAMDATA") {
        scan_start_menu_dir(
            PathBuf::from(program_data).join("Microsoft\\Windows\\Start Menu\\Programs"),
            &mut apps,
        );
    }
    if let Ok(app_data) = std::env::var("APPDATA") {
        scan_start_menu_dir(
            PathBuf::from(app_data).join("Microsoft\\Windows\\Start Menu\\Programs"),
            &mut apps,
        );
    }

    scan_app_paths(RegKey::predef(HKEY_LOCAL_MACHINE), &mut apps);
    scan_app_paths(RegKey::predef(HKEY_CURRENT_USER), &mut apps);

    apps
}

#[cfg(not(windows))]
pub fn discover() -> Vec<AppEntry> {
    Vec::new()
}

/// Fuzzy-matches `query` against discovered app names, returning the launch
/// target of the best match above a similarity threshold.
pub fn find_best_match(query: &str) -> Option<String> {
    let apps = discover();
    let query_lower = query.to_lowercase();

    apps.into_iter()
        .map(|app| {
            let score = strsim::jaro_winkler(&app.name.to_lowercase(), &query_lower);
            let contains_bonus = if app.name.to_lowercase().contains(&query_lower)
                || query_lower.contains(&app.name.to_lowercase())
            {
                0.15
            } else {
                0.0
            };
            (app.target, score + contains_bonus)
        })
        .filter(|(_, score)| *score >= 0.82)
        .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
        .map(|(target, _)| target)
}
