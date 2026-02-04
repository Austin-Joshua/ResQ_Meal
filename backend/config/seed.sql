-- ==================== SEED DATA ====================

-- Users
INSERT INTO users (email, password, name, phone_number, role, latitude, longitude) VALUES
('chef@kitchen.com', 'hashed_password_1', 'Chef Kumar', '8765432101', 'restaurant', 13.0827, 80.2707),
('ngo@savechildren.com', 'hashed_password_2', 'Priya Sharma', '9876543210', 'ngo', 13.0897, 80.2777),
('volunteer@community.com', 'hashed_password_3', 'Arjun Rao', '9123456789', 'volunteer', 13.0827, 80.2707),
('baker@artisan.com', 'hashed_password_4', 'Maria Silva', '8901234567', 'restaurant', 13.0850, 80.2650);

-- Restaurants
INSERT INTO restaurants (user_id, business_name, registration_number, daily_food_average, verified) VALUES
(1, 'Chef\'s Kitchen', 'REG001', 50, TRUE),
(4, 'Artisan Bakery', 'REG002', 30, TRUE);

-- NGOs
INSERT INTO ngos (user_id, organization_name, registration_number, daily_capacity, used_capacity, verified) VALUES
(2, 'Save Children India', 'NGO001', 500, 125, TRUE);

-- Volunteers
INSERT INTO volunteers (user_id, ngo_id, is_active) VALUES
(3, 1, TRUE);

-- Food Posts
INSERT INTO food_posts (
  restaurant_id, food_name, food_type, quantity_servings, description, 
  latitude, longitude, address, safety_window_minutes, expiry_time,
  freshness_score, urgency_score, status, posted_at
) VALUES
(
  1,
  'Fresh Grilled Vegetables',
  'vegetables',
  25,
  'Freshly grilled, no salt, gluten-free',
  13.0827, 80.2707,
  'Chef\'s Kitchen, Downtown, Chennai',
  45,
  DATE_ADD(NOW(), INTERVAL 45 MINUTE),
  1.0,
  68,
  'POSTED',
  NOW()
),
(
  1,
  'Cooked Pasta Dishes',
  'meals',
  40,
  'Italian pasta, tomato-based sauce, contains garlic',
  13.0827, 80.2707,
  'Chef\'s Kitchen, Downtown, Chennai',
  60,
  DATE_ADD(NOW(), INTERVAL 60 MINUTE),
  0.95,
  72,
  'POSTED',
  NOW()
),
(
  2,
  'Fresh Baked Bread',
  'baked',
  50,
  'Whole wheat bread, baked today morning',
  13.0850, 80.2650,
  'Artisan Bakery, Midtown, Chennai',
  90,
  DATE_ADD(NOW(), INTERVAL 90 MINUTE),
  1.0,
  45,
  'POSTED',
  NOW()
),
(
  1,
  'Dairy Desserts',
  'dairy',
  15,
  'Ice cream and yogurt desserts, refrigerated',
  13.0827, 80.2707,
  'Chef\'s Kitchen, Downtown, Chennai',
  120,
  DATE_ADD(NOW(), INTERVAL 120 MINUTE),
  0.98,
  35,
  'POSTED',
  NOW()
);

-- Matches (example of progression)
INSERT INTO matches (
  food_post_id, ngo_id, volunteer_id, status, match_score, distance_km,
  estimated_pickup_time_minutes, matched_at, accepted_at, picked_up_at
) VALUES
(
  1,
  1,
  1,
  'PICKED_UP',
  0.87,
  2.3,
  30,
  DATE_SUB(NOW(), INTERVAL 30 MINUTE),
  DATE_SUB(NOW(), INTERVAL 25 MINUTE),
  DATE_SUB(NOW(), INTERVAL 10 MINUTE)
);

-- Impact Logs (historical data)
INSERT INTO impact_logs (food_post_id, ngo_id, meals_saved, food_saved_kg, co2_saved_kg, water_saved_liters, created_at) VALUES
(1, 1, 25, 12.5, 62.5, 25000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 20, 10, 50, 20000, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 1, 30, 15, 75, 30000, NOW());

-- Sample Delivery Proof (when delivery is complete)
-- INSERT INTO delivery_proofs (match_id, photo_url, notes, verified) VALUES
-- (1, '/uploads/proof_1.jpg', 'Food delivered safely', TRUE);
