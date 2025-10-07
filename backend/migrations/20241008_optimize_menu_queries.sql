-- Optimization migration for faster menu queries
-- Created: 2024-10-08

-- Add composite index for category and dish_name sorting
CREATE INDEX IF NOT EXISTS idx_menu_category_dish_name 
ON menu (category, dish_name);

-- Add index for stock_status filtering
CREATE INDEX IF NOT EXISTS idx_menu_stock_status 
ON menu (stock_status);

-- Add composite index for category filtering with stock status
CREATE INDEX IF NOT EXISTS idx_menu_category_stock 
ON menu (category, stock_status);

-- Add index for dish_name for search functionality
CREATE INDEX IF NOT EXISTS idx_menu_dish_name_search 
ON menu USING gin(to_tsvector('english', dish_name));

-- Add index for description search
CREATE INDEX IF NOT EXISTS idx_menu_description_search 
ON menu USING gin(to_tsvector('english', description));

-- Update table statistics for better query planning
ANALYZE menu;

-- Optional: Add materialized view for frequently accessed menu data
CREATE MATERIALIZED VIEW IF NOT EXISTS menu_summary AS
SELECT 
    menu_id,
    dish_name,
    category,
    price,
    image_url,
    stock_status,
    created_at,
    updated_at
FROM menu
WHERE stock_status != 'out_of_stock'
ORDER BY category, dish_name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_summary_id 
ON menu_summary (menu_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_menu_summary()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY menu_summary;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-refresh materialized view on menu changes
DROP TRIGGER IF EXISTS trigger_refresh_menu_summary ON menu;
CREATE TRIGGER trigger_refresh_menu_summary
    AFTER INSERT OR UPDATE OR DELETE ON menu
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_menu_summary();