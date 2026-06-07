-- Performance indexes for matching, listings, and token purge

CREATE INDEX idx_food_posts_status_expiry ON food_posts(status, expiry_time);
CREATE INDEX idx_food_posts_restaurant_id ON food_posts(restaurant_id);
CREATE INDEX idx_matches_food_post_status ON matches(food_post_id, status);
CREATE INDEX idx_matches_ngo_status ON matches(ngo_id, status);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, read_at, created_at);
