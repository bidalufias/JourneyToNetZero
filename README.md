# Journey to Net Zero

A clean slate. The previous game — a four-player realtime simulation built on
Vite, React and Supabase — has been removed along with its database schema, and
new gameplay will be built here from scratch.

## Current state

- No application code, no build setup. The stack is an open decision.
- Supabase project `journey-to-net-zero`
  (`dsibzzchpokqwscjrbif`, region `ap-southeast-1`) is active and empty: no
  tables, functions, policies, storage buckets or migrations.
- Netlify project `journeytonetzero` still serves the last build of the old
  game. It publishes `dist/` from `npm run build` and will redeploy over that
  once new code lands on `main`.
