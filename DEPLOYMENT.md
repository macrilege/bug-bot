# LH BugBot Deployment Guide

This project has been configured for deployment to: **https://lh-bugbot.vanston27.workers.dev/**

## Prerequisites

1. **Cloudflare Account**: Ensure you're logged into the correct Cloudflare account (vanston27)
2. **Wrangler CLI**: Make sure Wrangler is installed and authenticated

## Setup Steps

### 1. Install Dependencies
```bash
cd C:\Users\micmc\projects\lh-bugbot
npm install
```

### 2. Authenticate Wrangler (if needed)
```bash
wrangler auth
```
Make sure you're logged into the vanston27 account.

### 3. Create Vectorize Index
```bash
wrangler vectorize create pest-control-knowledge --dimensions=768 --metric=cosine
```

### 4. Deploy the Worker
```bash
npm run deploy
```

## Verification

After deployment, verify these URLs work:
- Main site: https://lh-bugbot.vanston27.workers.dev/
- CSS file: https://lh-bugbot.vanston27.workers.dev/chat-widget.css
- JS file: https://lh-bugbot.vanston27.workers.dev/chat-widget-lhpest.js
- Embed script: https://lh-bugbot.vanston27.workers.dev/embed.js

## Embedding on External Sites

### Option 1: One-line embed (recommended)
```html
<script src="https://lh-bugbot.vanston27.workers.dev/embed.js" defer></script>
```

### Option 2: Manual embed
```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<link rel="stylesheet" href="https://lh-bugbot.vanston27.workers.dev/chat-widget.css">

<!-- Before </body> -->
<script src="https://lh-bugbot.vanston27.workers.dev/chat-widget-lhpest.js" defer></script>
```

## Vector Database

The vector database will automatically initialize on the first chat request. To manually initialize:

```bash
curl -X POST "https://lh-bugbot.vanston27.workers.dev/api/admin/init-vectors"
```

Check status:
```bash
curl "https://lh-bugbot.vanston27.workers.dev/api/admin/vector-status"
```

## Project Structure

- `src/index.ts` - Main Worker code with RAG implementation
- `src/vector-service.ts` - Vector database operations
- `src/knowledge-base.ts` - Pest control knowledge data
- `public/` - Static assets (CSS, JS, HTML)
- `wrangler.jsonc` - Cloudflare Worker configuration

## Configuration Updated

All URLs have been updated to use `https://lh-bugbot.vanston27.workers.dev/`:
- ✅ `chat-widget-lhpest.js` - API base URL
- ✅ `embed.js` - BASE constant
- ✅ `index.html` - CSS and JS links
- ✅ `wrangler.jsonc` - Worker name set to "lh-bugbot"

## Troubleshooting

1. **Authentication errors**: Run `wrangler auth` to re-authenticate
2. **Vectorize errors**: Ensure the index exists with the correct name and dimensions
3. **404 errors**: Verify the worker is deployed and accessible
4. **CORS errors**: The worker includes proper CORS headers for external embedding
