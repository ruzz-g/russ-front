# Product Management System — React Frontend

React 18 + Vite + Axios client for the **LavaLust Product API**.
Flow: **Login → Product List → Add / Edit / Delete → Logout**.
The app talks only to the LavaLust API (never directly to the database).

## Run locally

```bash
npm install
cp .env.example .env        # then set VITE_API_URL
npm run dev                 # http://localhost:5173
```

`.env`

```
VITE_API_URL=http://localhost:3000        # local LavaLust API (php lava serve)
# VITE_API_URL=https://your-api.onrender.com   # deployed API
```

## Features

- Login / Register (JWT access token + refresh token)
- Access token is attached automatically to every request; when it expires the
  app silently gets a new one with the refresh token and retries the request
- Product list with search, add, edit, delete (with confirmation) and logout
- Validation messages from the API are shown in the forms

## Deploy to Render (Static Site)

1. Push this folder to its own GitHub repository.
2. Render → **New + → Static Site** → select the repository.
3. **Build command:** `npm install && npm run build`
4. **Publish directory:** `dist`
5. **Environment variable:** `VITE_API_URL` = your Render API URL (no trailing slash).
6. Deploy, then copy the frontend URL into the API's `ALLOW_ORIGIN` environment variable.

> `VITE_*` variables are baked in at build time — redeploy after changing them.
