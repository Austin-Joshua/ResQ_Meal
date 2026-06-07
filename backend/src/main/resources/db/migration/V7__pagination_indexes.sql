-- Pagination sort index for food post listings

CREATE INDEX idx_food_posts_created_at_desc ON food_posts(created_at DESC);
