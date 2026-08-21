// Static export (`output: 'export'`, used for the Tauri desktop build) cannot
// contain Next.js route handlers (app/api/**) at all — not even with
// `force-static`. The desktop build talks to providers directly from the
// client (see lib/chat-client.ts), so the API routes are dead weight there.
// This script moves app/api out of the way for the duration of the export
// build and restores it afterward, so the same source tree serves both the
// server-backed web build and the static desktop build.

import { existsSync, renameSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const apiDir = join(root, 'app', 'api')
const apiBackup = join(root, 'app', '_api.build-backup')

function restore() {
  if (existsSync(apiBackup)) {
    renameSync(apiBackup, apiDir)
  }
}

process.on('exit', restore)
process.on('SIGINT', () => process.exit(1))

if (existsSync(apiDir)) {
  renameSync(apiDir, apiBackup)
}

const result = spawnSync('npx', ['next', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, TAURI_BUILD: 'true' },
})

process.exit(result.status ?? 1)
