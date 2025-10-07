-- Performance optimization indexes for menu table
-- Run this in your Supabase SQL Editor

-- Index for category filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);

-- Index for stock status filtering
CREATE INDEX IF NOT EXISTS idx_menu_stock_status ON menu(stock_status);

-- Composite index for category + stock status (common combination)
CREATE INDEX IF NOT EXISTS idx_menu_category_stock ON menu(category, stock_status);

-- Index for dish name ordering (used in ORDER BY)
CREATE INDEX IF NOT EXISTS idx_menu_dish_name ON menu(dish_name);

-- Composite index for optimal query performance
CREATE INDEX IF NOT EXISTS idx_menu_optimal ON menu(category, stock_status, dish_name);

-- VACUUM and ANALYZE to update table statistics
VACUUM ANALYZE menu;