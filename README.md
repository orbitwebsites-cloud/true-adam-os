# TRUE ADAM • Core OS

A free AI operating system powered by Groq, Cerebras, and other free APIs. Built with Next.js, streaming responses, no costs.

## Features

✨ **Free AI** — Groq, Cerebras, Together AI, OpenRouter (no billing)  
🖥️ **Desktop App** — Native app for Windows/macOS/Linux via Tauri (see [DESKTOP_APP_GUIDE.md](./DESKTOP_APP_GUIDE.md))  
⚡ **Blazing Fast** — Sub-second inference times  
📱 **Mobile Ready** — Works perfectly on all devices  
🎙️ **Voice Input** — Record and chat via microphone  
🔄 **Streaming with auto-retry** — Transient errors retry automatically, with fallback across providers  
💾 **Persistent chat history** — Conversations survive refreshes/restarts  
🧹 **Clean UI** — Minimal, handbuilt aesthetic  

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2 (Rust) — system tray, global hotkey, native installers
- **AI**: Groq, Cerebras, Together AI, OpenRouter (OpenAI-compatible)
- **Deployment**: Vercel (web) / Tauri bundler (desktop)
- **Runtime**: Node.js

## Quick Start

### 1. Prerequisites

- Node.js 18+
- At least one free API key (see below)

### 2. Get Free API Keys

Pick one (or all):

- **Groq** (Fastest): https://console.groq.com - `GROQ_API_KEY`
- **Cerebras**: https://www.cerebras.ai/api - `CEREBRAS_API_KEY`
- **Together AI**: https://www.together.ai - `TOGETHER_API_KEY`
- **OpenRouter**: https://openrouter.ai - `OPENROUTER_API_KEY`

### 3. Setup

```bash
npm install
cp .env.example .env.local
# Add your API key(s) to .env.local

npm run dev
```

Visit `http://localhost:3000`

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your API key to Vercel dashboard and redeploy.

## Usage

- Type messages or use voice
- Responses stream in real-time
- No subscriptions, no limits, no bills

---

Built with free APIs for everyone.
