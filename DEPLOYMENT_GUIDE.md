# TRUE ADAM Deployment Guide

## Quick Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Set Up Environment Variables

Create `.env.local` locally:

```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

Get your Claude API key from: https://console.anthropic.com/account/keys

### Step 3: Deploy

```bash
vercel login
vercel
```

Answer prompts:
- Project name: `true-adam-os`
- Framework: Automatic (Next.js)
- Root directory: `.`

### Step 4: Set Production Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
ANTHROPIC_API_KEY = sk-ant-your-production-key
```

### Step 5: Redeploy

```bash
vercel --prod
```

## Custom Domain Setup

1. Go to Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records per Vercel's instructions

## Monitoring

After deployment:
- Check logs: `vercel logs true-adam-os`
- View deployment: `vercel list`
- Monitor performance: Vercel Analytics Dashboard

## Troubleshooting

**500 Error on chat endpoint?**
- Verify `ANTHROPIC_API_KEY` is set in Vercel
- Check that the API key is valid and has available quota

**Voice transcription not working?**
- Browser must have microphone permission
- Check browser console for errors
- Implement actual Whisper API integration (placeholder in v1)

**Slow responses?**
- Claude API calls typically take 2-5 seconds
- Edge caching is configured on Vercel
- Consider using streaming for better UX

---

That's it! Your TRUE ADAM is live on Vercel. 🚀
