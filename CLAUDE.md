# SkillSwap – BUS4012 Assignment 3

Stack: React (Next.js) frontend in /frontend, Python FastAPI backend in /backend, Supabase (Postgres + Auth), deployed on Vercel as two projects.

Rules:
- Never read, print, or modify any .env file. Use env vars only via os.getenv.
- The frontend must never contain Supabase keys. It only calls the backend via NEXT_PUBLIC_API_URL.
- All Supabase access goes through the backend using SUPABASE_SERVICE_ROLE_KEY.
- RLS is enabled on all tables. Enforce ownership checks in backend routes.
- Keep code simple and readable; explain changes briefly when done.