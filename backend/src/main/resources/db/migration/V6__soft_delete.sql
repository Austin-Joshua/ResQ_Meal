-- Soft delete support for food posts

ALTER TABLE food_posts ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX idx_food_posts_deleted_at ON food_posts(deleted_at);
