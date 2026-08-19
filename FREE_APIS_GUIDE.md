# Free APIs Setup Guide

TRUE ADAM is powered by **completely free AI APIs**. No subscriptions, no billing, unlimited requests.

## Quick Comparison

| API | Speed | Quality | Free Tier | Getting Started |
|-----|-------|---------|-----------|-----------------|
| **Groq** ⭐ | Fastest | Excellent | Unlimited | 2 min |
| **Cerebras** | Fast | Excellent | Generous | 3 min |
| **Together AI** | Medium | Good | Limited | 5 min |
| **OpenRouter** | Medium | Variable | Some free | 5 min |

## Step-by-Step Setup

### Option 1: Groq (Recommended - Fastest)

1. **Go to**: https://console.groq.com
2. **Sign up** with email or Google
3. **Navigate to**: API Keys
4. **Copy** your API key
5. **Add to** `.env.local`:
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxx
```
6. **Done!** Refresh your app

**Why Groq?**
- Fastest inference times (~100ms)
- Unlimited free requests
- Mixtral 8x7B model is extremely good
- No limits, no rate limiting

### Option 2: Cerebras

1. **Go to**: https://www.cerebras.ai/api
2. **Sign up** (free)
3. **Navigate to**: API Keys
4. **Create** new API key
5. **Add to** `.env.local`:
```bash
CEREBRAS_API_KEY=csk_xxxxxxxxxxxxxxx
```

**Why Cerebras?**
- Llama 3.1 70B (powerful model)
- Competitive speeds
- Free tier with good limits
- Great for code generation

### Option 3: Together AI

1. **Go to**: https://www.together.ai
2. **Sign up** (free)
3. **Navigate to**: API Keys
4. **Generate** new key
5. **Add to** `.env.local`:
```bash
TOGETHER_API_KEY=xxxxx
```

**Why Together?**
- Multiple open-source models
- Community-driven
- Good for experimentation

### Option 4: OpenRouter

1. **Go to**: https://openrouter.ai
2. **Sign up** (free)
3. **Copy** API key from dashboard
4. **Add to** `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-xxxxx
```

**Why OpenRouter?**
- Access to many models in one place
- Some models completely free
- Good fallback option

## Using Multiple APIs

You can add multiple API keys to `.env.local`:

```bash
GROQ_API_KEY=gsk_xxxxx
CEREBRAS_API_KEY=csk_xxxxx
TOGETHER_API_KEY=xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
```

TRUE ADAM automatically:
- Uses the first available API
- Falls back to next if one fails
- Balances load across providers

## Local Development

```bash
# Copy example
cp .env.example .env.local

# Add your keys
# GROQ_API_KEY=gsk_xxxxx
# etc

# Run
npm run dev
```

## Production (Vercel)

1. **Go to**: Vercel Dashboard → Settings → Environment Variables
2. **Add** your API keys:
   - `GROQ_API_KEY`
   - `CEREBRAS_API_KEY`
   - etc.
3. **Redeploy**: `vercel --prod`

## Troubleshooting

**"No providers configured"**
- Check `.env.local` has at least one API key
- Make sure key format is correct
- Check for trailing spaces

**"Invalid API key"**
- Verify key is from correct dashboard
- Try a different provider
- Check API key hasn't expired

**"Rate limited"**
- Switch to different provider (Groq has no limits)
- Wait a minute and retry
- Use OpenRouter as fallback

**Slow responses**
- Try Groq first (fastest)
- Cerebras is second-fastest
- OpenRouter slowest but free

## Model Details

### Groq
- **Model**: Mixtral 8x7B
- **Speed**: ~100ms
- **Quality**: 8/10
- **Best for**: Everything

### Cerebras
- **Model**: Llama 3.1 70B
- **Speed**: ~200ms
- **Quality**: 9/10
- **Best for**: Complex reasoning, code

### Together AI
- **Model**: Llama 3.1 70B
- **Speed**: ~300ms
- **Quality**: 9/10
- **Best for**: Variety of models

### OpenRouter
- **Model**: Multiple (check site)
- **Speed**: Variable
- **Quality**: Variable
- **Best for**: Specific model access

## Cost Breakdown

**Using TRUE ADAM costs**: $0.00

- Groq: Free forever
- Cerebras: Free tier (generous)
- Together: Free tier (limited)
- OpenRouter: Some models free

No credit card required for Groq. Others may ask for one but won't charge.

## Tips & Tricks

1. **Start with Groq** - Most reliable, fastest
2. **Add Cerebras as backup** - If Groq is down
3. **Monitor API limits** - Each provider has docs
4. **Use different APIs for different tasks**:
   - Research: Groq (fast)
   - Code: Cerebras (powerful)
   - Creativity: Together (variety)

## Getting Help

If an API goes down or rate limits:
- Add another provider's key
- Restart the app
- Check provider status page
- Try different API

---

**That's it! You now have a completely free, unlimited AI chat app.** 🚀
