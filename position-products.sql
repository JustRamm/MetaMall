-- Update product positions to place them around the H&M store
-- This script positions clothing products in strategic locations throughout the store

-- Ground Floor - Left Wing (Women's Section)
-- Clothing racks along the left wall
UPDATE products SET position_x = -25, position_y = -10 WHERE category = 'Clothing' AND name LIKE '%Dress%' LIMIT 1;
UPDATE products SET position_x = -25, position_y = 0 WHERE category = 'Clothing' AND name LIKE '%Blouse%' LIMIT 1;
UPDATE products SET position_x = -25, position_y = 10 WHERE category = 'Clothing' AND name LIKE '%Skirt%' LIMIT 1;

-- Central display tables
UPDATE products SET position_x = -10, position_y = 15 WHERE category = 'Clothing' AND name LIKE '%T-Shirt%' LIMIT 1;
UPDATE products SET position_x = 0, position_y = 15 WHERE category = 'Clothing' AND name LIKE '%Jeans%' LIMIT 1;
UPDATE products SET position_x = 10, position_y = 15 WHERE category = 'Clothing' AND name LIKE '%Jacket%' LIMIT 1;

-- Ground Floor - Right Wing (Men's Section)
UPDATE products SET position_x = 25, position_y = -10 WHERE category = 'Clothing' AND name LIKE '%Shirt%' LIMIT 1;
UPDATE products SET position_x = 25, position_y = 0 WHERE category = 'Clothing' AND name LIKE '%Polo%' LIMIT 1;
UPDATE products SET position_x = 25, position_y = 10 WHERE category = 'Clothing' AND name LIKE '%Sweater%' LIMIT 1;

-- Accessories near entrance
UPDATE products SET position_x = -5, position_y = 30 WHERE category = 'Accessories' LIMIT 1;
UPDATE products SET position_x = 5, position_y = 30 WHERE category = 'Accessories' OFFSET 1 LIMIT 1;

-- Shoes section
UPDATE products SET position_x = -20, position_y = -15 WHERE category = 'cloth' AND description LIKE '%shoe%' LIMIT 1;
UPDATE products SET position_x = 20, position_y = -15 WHERE category = 'cloth' AND description LIKE '%sneaker%' LIMIT 1;

-- Additional clothing items scattered around
UPDATE products SET position_x = -15, position_y = 5 WHERE category = 'Clothing' OFFSET 6 LIMIT 1;
UPDATE products SET position_x = -15, position_y = -5 WHERE category = 'Clothing' OFFSET 7 LIMIT 1;
UPDATE products SET position_x = 15, position_y = 5 WHERE category = 'Clothing' OFFSET 8 LIMIT 1;
UPDATE products SET position_x = 15, position_y = -5 WHERE category = 'Clothing' OFFSET 9 LIMIT 1;

-- Near the central stairs
UPDATE products SET position_x = -8, position_y = 0 WHERE category = 'cloth' OFFSET 10 LIMIT 1;
UPDATE products SET position_x = 8, position_y = 0 WHERE category = 'cloth' OFFSET 11 LIMIT 1;

-- Back of store
UPDATE products SET position_x = -12, position_y = -20 WHERE category = 'cloth' OFFSET 12 LIMIT 1;
UPDATE products SET position_x = 0, position_y = -20 WHERE category = 'cloth' OFFSET 13 LIMIT 1;
UPDATE products SET position_x = 12, position_y = -20 WHERE category = 'cloth' OFFSET 14 LIMIT 1;

-- Near fitting rooms (right side)
UPDATE products SET position_x = 22, position_y = 8 WHERE category = 'cloth' OFFSET 15 LIMIT 1;
UPDATE products SET position_x = 22, position_y = 12 WHERE category = 'cloth' OFFSET 16 LIMIT 1;

-- Left side displays
UPDATE products SET position_x = -22, position_y = 20 WHERE category = 'cloth' OFFSET 17 LIMIT 1;
UPDATE products SET position_x = -22, position_y = 25 WHERE category = 'cloth' OFFSET 18 LIMIT 1;

-- Additional scattered positions for remaining items
UPDATE products SET position_x = -18, position_y = 12 WHERE category = 'cloth' OFFSET 19 LIMIT 1;
UPDATE products SET position_x = 18, position_y = 12 WHERE category = 'cloth' OFFSET 20 LIMIT 1;
UPDATE products SET position_x = -5, position_y = 8 WHERE category = 'cloth' OFFSET 21 LIMIT 1;
UPDATE products SET position_x = 5, position_y = 8 WHERE category = 'cloth' OFFSET 22 LIMIT 1;

-- Near escalators
UPDATE products SET position_x = -12, position_y = 3 WHERE category = 'cloth' OFFSET 23 LIMIT 1;
UPDATE products SET position_x = 12, position_y = 3 WHERE category = 'cloth' OFFSET 24 LIMIT 1;

-- Beauty/Accessories section
UPDATE products SET position_x = -8, position_y = 25 WHERE category = 'Beauty' LIMIT 1;
UPDATE products SET position_x = 8, position_y = 25 WHERE category = 'Beauty' OFFSET 1 LIMIT 1;

-- Office/Electronics (if any)
UPDATE products SET position_x = 0, position_y = -25 WHERE category = 'Office' LIMIT 1;
UPDATE products SET position_x = -10, position_y = -25 WHERE category = 'Electronics' LIMIT 1;

-- Toys/Kitchen (if any) - back corners
UPDATE products SET position_x = -20, position_y = -30 WHERE category = 'Toys' LIMIT 1;
UPDATE products SET position_x = 20, position_y = -30 WHERE category = 'Kitchen' LIMIT 1;

-- Verify the updates
SELECT id, name, category, position_x, position_y, price 
FROM products 
WHERE category IN ('Clothing', 'cloth', 'Accessories', 'Beauty')
ORDER BY position_y DESC, position_x;
