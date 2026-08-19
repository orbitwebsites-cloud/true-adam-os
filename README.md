# TRUE ADAM • Core OS

An advanced AI operating system built with Next.js + Claude 3.5 Sonnet. Features persistent memory, voice input, streaming responses, and beautiful UI.

## Features

✨ **AI-Powered Chat** — Claude 3.5 Sonnet with streaming responses  
🎙️ **Voice Input** — Real-time transcription  
⚡ **Lightning Fast** — Deployed on Vercel with global edge network  
📱 **Responsive Design** — Works on mobile, tablet, and desktop  
🎨 **Beautiful UI** — Modern gradient-based dark theme with smooth animations  

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **AI**: Anthropic Claude 3.5 Sonnet API
- **Deployment**: Vercel

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- Anthropic API key (get from https://console.anthropic.com)

### 2. Environment Setup

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_claude_api_key
```

### 3. Run Development Server

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

```bash
npm install -g vercel
vercel login
vercel deploy
```

Set `ANTHROPIC_API_KEY` in Vercel dashboard.

## Usage

- **Text Chat**: Type messages and press Enter
- **Voice Input**: Click the microphone button to record
- **Clear History**: Use the sidebar menu
- **Markdown Support**: Responses include formatted text, code blocks, tables

---

Built with ⚡ for maximum productivity.
