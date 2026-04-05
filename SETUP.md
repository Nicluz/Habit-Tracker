# Habit Tracker — Setup Guide

## Step 1 — Create a Supabase project

1. Go to **supabase.com** → Sign up (free)
2. Click **New project**
3. Choose a name (e.g. `habit-tracker`) and a strong database password
4. Wait ~2 minutes for the project to start

## Step 2 — Create the database tables

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Paste the contents of `schema.sql` (in this project folder)
4. Click **Run**

## Step 3 — Create your user account

1. In Supabase, go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a strong password
4. Click **Create user**

## Step 4 — Get your API keys

1. In Supabase, go to **Settings → API**
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon / public** key

## Step 5 — Configure the app locally

1. In this project folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and fill in your keys:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6 — Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser and log in.

## Step 7 — Deploy to Netlify

1. Go to **netlify.com** → Sign up (free)
2. Click **Add new site → Import an existing project**
3. Connect to GitHub (push this folder to a GitHub repo first), or use **Deploy manually**

### Option A — GitHub (recommended for updates)
1. Push this folder to a private GitHub repo
2. In Netlify: **Import from Git → GitHub → Select your repo**
3. Build settings are auto-detected from `netlify.toml`
4. Go to **Site settings → Environment variables**
5. Add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
6. **Trigger deploy** (or it deploys automatically)

### Option B — Drag and drop
1. Run `npm run build` locally
2. Drag the `dist/` folder into Netlify's deploy area
3. ⚠️ Environment variables won't work this way — use Option A

## Step 8 — Access from iPhone

Once deployed to Netlify, you'll get a URL like `https://your-site.netlify.app`.

- Open it in Safari on your iPhone
- Tap **Share → Add to Home Screen** for an app-like experience

---

## Architecture

```
Frontend (React + Vite + Tailwind v4)
  └── Hosted on Netlify (free tier)

Database + Auth
  └── Supabase (free tier — PostgreSQL)
      ├── daily_entries      (one row per day)
      ├── custom_activities  (your custom workout types)
      └── training_completions (marks gym sessions as done)
```

## Local development with live Supabase data

The app talks directly to Supabase from the browser using the anon key + Row Level Security. No backend server needed — Netlify just serves the static files.
