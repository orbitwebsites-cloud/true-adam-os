# TRUE ADAM Desktop App

TRUE ADAM ships as a native desktop app (Windows/macOS/Linux) built with [Tauri](https://tauri.app), on top of the same Next.js frontend used for the web version.

## How it's different from the web version

The web version proxies chat requests through a Next.js server route (`/api/chat`), which keeps API keys server-side. A desktop app has no server — so the desktop build:

- Talks to the AI provider **directly from the app** (`lib/chat-client.ts`)
- Stores your API key **locally on your machine only** (never sent anywhere but the provider)
- Lets you pick a provider and paste a key from the **Settings** panel (gear icon, top right)

Nothing here is baked into the app at build time — you bring your own free key.

## Running it

### Development

```bash
npm install
npm run tauri:dev
```

This starts the Next.js dev server and opens it in a native window with hot reload.

### Building an installer

```bash
npm run tauri:build
```

Produces platform-native installers in `src-tauri/target/release/bundle/`:

- **Windows**: `.msi` and `.exe` (NSIS)
- **macOS**: `.dmg` and `.app`
- **Linux**: `.deb`, `.rpm`, `.AppImage`

### Prerequisites

- **Node.js** 18+
- **Rust** (install via [rustup](https://rustup.rs))
- **Windows**: Visual Studio Build Tools (C++ workload)
- **macOS**: Xcode Command Line Tools
- **Linux**: `webkit2gtk`, `libappindicator3` (see [Tauri prerequisites](https://tauri.app/start/prerequisites/))

## Desktop-only features

- **System tray** — closing the window minimizes it to the tray instead of quitting. Right-click the tray icon for Show/Quit.
- **Global hotkey** — `Ctrl+Shift+A` shows/hides the window from anywhere, even when unfocused.
- **Local persistence** — chat history and your API key survive restarts (stored in the app's local storage, on-device only).

## Setting up a provider

1. Launch the app
2. Click the ⚙️ **Settings** icon (top right)
3. Paste a free API key for at least one provider:
   - **Groq**: https://console.groq.com/keys (fastest, recommended)
   - **Cerebras**: https://cloud.cerebras.ai
   - **Together AI**: https://api.together.ai/settings/api-keys
   - **OpenRouter**: https://openrouter.ai/keys
4. Click **Use** next to the provider you added a key for
5. Click **Save**

You can add multiple provider keys and switch between them anytime from Settings.

## Architecture notes

- `next.config.ts` conditionally sets `output: 'export'` when `TAURI_BUILD=true` — this produces a fully static site Tauri can bundle (no Node.js server required at runtime).
- `scripts/build-desktop.mjs` temporarily moves `app/api/**` out of the tree during the static export, since Next.js static export cannot contain server route handlers at all. It's restored immediately after the build (even on failure).
- `src-tauri/src/lib.rs` wires up the system tray, global shortcut, and close-to-tray behavior.
- `lib/chat-client.ts` is the client-side equivalent of the server's `/api/chat` route — same retry logic, same streaming parser, but called directly from the browser/webview with a locally-stored key.
