-- SQL migration for menu table constraints, trigger, and RLS

-- 1. Ensure menu_id is primary key and auto-generated
ALTER TABLE menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (menu_id);

-- 2. CHECK constraint for stock_status
ALTER TABLE menu
    ADD CONSTRAINT stock_status_check CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

-- 3. Trigger to set updated_at on INSERT/UPDATE
CREATE OR REPLACE FUNCTION set_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_menu_updated_at ON menu;
CREATE TRIGGER trg_set_menu_updated_at
    BEFORE INSERT OR UPDATE ON menu
    FOR EACH ROW EXECUTE FUNCTION set_menu_updated_at();

-- 4. Enable Realtime on menu (done in Supabase dashboard)

-- 5. Enable RLS and anon read-only policy
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;

-- Allow anon SELECT and Realtime
CREATE POLICY "Anon read menu" ON menu
    FOR SELECT USING (true);

-- (Optional) Allow Realtime for anon
CREATE POLICY "Anon realtime menu" ON menu
    FOR ALL USING (false) WITH CHECK (false);

-- Service role can do anything (handled by Supabase default policies)
