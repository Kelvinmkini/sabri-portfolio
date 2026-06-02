# Sabri Portfolio Deployment

## 1. Backend on Render

Create a new Render Web Service from this project/repository.

Settings:
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Environment variables:
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app`

After Render finishes, copy the backend URL, for example:
`https://sabri-portfolio-backend.onrender.com`

Test it:
`https://YOUR-RENDER-BACKEND.onrender.com/health`

## 2. Frontend on Vercel

Before deploying frontend, update `index.html`:

```js
const BACKEND_URL = window.BACKEND_URL || 'https://YOUR-RENDER-BACKEND.onrender.com';
```

Then deploy the same project to Vercel as a static site.

Vercel settings:
- Framework preset: Other
- Build command: leave empty or `npm run build`
- Output directory: leave empty / project root

## 3. Final CORS update

After Vercel gives you the frontend URL, go back to Render and update:

`ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN.vercel.app`

Redeploy/restart the Render service after changing the env var.
