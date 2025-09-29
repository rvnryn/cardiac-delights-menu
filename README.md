# Cardiac_Delights_Menu_Website

## Environment Variables

### Backend (FastAPI)

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Service role key (server-side only)
- `POSTGRES_URL` - (If using SQLAlchemy/Postgres directly)

### Frontend (Next.js)

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon public key

## Database Setup

1. Run the migration in `backend/migrations/20250926_menu_schema.sql` on your Supabase/Postgres instance.
2. Enable Realtime for the `menu` table in the Supabase dashboard.
3. Enable Row Level Security (RLS) and add the anon SELECT policy.

## Backend (FastAPI)

- Install dependencies: `pip install -r requirements.txt`
- Set environment variables in a `.env` file.
- Run the server: `uvicorn app.main:app --reload`
- Endpoints:
  - `GET /api/menu` - List all menu items (with optional filters)
  - `GET /api/menu/{menu_id}` - Get a single menu item

## Frontend (Next.js)

- Install dependencies: `npm install`
- Set environment variables in `.env.local`.
- Run the dev server: `npm run dev`
- The frontend fetches `/api/menu` for SSR and uses Supabase Realtime for live updates.

## Realtime

- The frontend subscribes to the `menu` table using Supabase Realtime and updates the UI on INSERT/UPDATE/DELETE.

## Testing

- Unit tests for FastAPI endpoints (pytest)
- E2E tests (Cypress/Playwright) for live menu updates

---

For more details, see the build prompt in the project root.
