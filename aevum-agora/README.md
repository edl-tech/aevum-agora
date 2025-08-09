# Aevum Agora

A modern, responsive community web app for architectural discourse.

## Tech
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres, Auth, Realtime)

## Features
- Auth: OAuth or magic link; roles: member, moderator, admin
- Topics, threads, posts with text, images, and links
- Likes, comments, replies
- Search and filters
- Realtime updates and notifications for mentions/replies

## Setup
1. Create a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Run SQL in `db/migrations/0001_init.sql` to create tables and RLS policies.
3. Install deps and start dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Privacy & Security
- Supabase RLS secures data per user
- Only minimal PII stored in `profiles`
- Content sanitized on display (todo)