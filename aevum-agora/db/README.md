# Database Notes

- Run `migrations/0001_init.sql` in Supabase SQL editor after creating the project.
- Enable Realtime for schema `public` in Supabase dashboard > Realtime.
- Add OAuth providers (GitHub/Google) in Supabase Auth with callback URL:
  - `https://YOUR-VERCEL-DOMAIN.vercel.app`
  - and `http://localhost:3000` for local