-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role ENUM('restaurant', 'ngo', 'volunteer') NOT NULL DEFAULT 'restaurant',
  address VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== RESTAURANTS TABLE ====================
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(255) UNIQUE,
  daily_food_average INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== NGOS TABLE ====================
CREATE TABLE ngos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  organization_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(255) UNIQUE,
  daily_capacity INT NOT NULL DEFAULT 100,
  used_capacity INT NOT NULL DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_capacity (daily_capacity),
  INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== VOLUNTEERS TABLE ====================
CREATE TABLE volunteers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  ngo_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
  INDEX idx_ngo_id (ngo_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== FOOD POSTS TABLE ====================
CREATE TABLE food_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  food_type ENUM('meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others') NOT NULL,
  quantity_servings INT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(255),
  photo_url VARCHAR(255),
  preparation_timestamp TIMESTAMP,
  safety_window_minutes INT NOT NULL DEFAULT 30,
  expiry_time TIMESTAMP NOT NULL,
  min_storage_temp_celsius DECIMAL(4, 1),
  max_storage_temp_celsius DECIMAL(4, 1),
  availability_time_hours INT,
  freshness_score DECIMAL(3, 2) DEFAULT 1.00,
  quality_score DECIMAL(3, 2),
  urgency_score INT DEFAULT 50,
  status ENUM('POSTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED') DEFAULT 'POSTED',
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  matched_at TIMESTAMP NULL,
  accepted_at TIMESTAMP NULL,
  picked_up_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  expired_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_urgency_score (urgency_score),
  INDEX idx_expiry_time (expiry_time),
  INDEX idx_posted_at (posted_at),
  FULLTEXT INDEX idx_food_name_text (food_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== ORGANISATION FOOD (donor/restaurant or NGO-posted food for volunteers) ====================
CREATE TABLE organisation_food (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ngo_id INT NULL,
  restaurant_id INT NULL,
  food_name VARCHAR(255) NOT NULL,
  food_type ENUM('meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others') NOT NULL DEFAULT 'others',
  quantity_servings INT NOT NULL DEFAULT 1,
  description TEXT,
  address VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  freshness_score INT NULL COMMENT 'From Fresh Food Checker (0-100)',
  quality_score INT NULL COMMENT 'From Fresh Food Checker (0-100)',
  status ENUM('PENDING', 'ASSIGNED', 'DELIVERED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_ngo_id (ngo_id),
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== MATCHES TABLE ====================
CREATE TABLE matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  food_post_id INT NOT NULL,
  ngo_id INT NOT NULL,
  volunteer_id INT,
  status ENUM('POSTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED') DEFAULT 'MATCHED',
  match_score DECIMAL(3, 2),
  distance_km DECIMAL(6, 2),
  estimated_pickup_time_minutes INT,
  delivery_proof_photo VARCHAR(255),
  notes TEXT,
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  picked_up_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (food_post_id) REFERENCES food_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_ngo_id (ngo_id),
  INDEX idx_food_post_id (food_post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== IMPACT LOGS TABLE ====================
CREATE TABLE impact_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  food_post_id INT NOT NULL,
  ngo_id INT NOT NULL,
  meals_saved INT NOT NULL DEFAULT 0,
  food_saved_kg DECIMAL(8, 2) NOT NULL DEFAULT 0,
  co2_saved_kg DECIMAL(8, 2) NOT NULL DEFAULT 0,
  water_saved_liters DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_post_id) REFERENCES food_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
  INDEX idx_created_at (created_at),
  INDEX idx_ngo_id (ngo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== DELIVERY PROOF TABLE ====================
CREATE TABLE delivery_proofs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL UNIQUE,
  photo_url VARCHAR(255) NOT NULL,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== AI FEEDBACK TABLE (for learning from outcomes) ====================
CREATE TABLE IF NOT EXISTS ai_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  ngo_id INT NOT NULL,
  food_post_id INT NOT NULL,
  outcome ENUM('accepted', 'rejected', 'delivered') NOT NULL,
  delay_minutes INT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_match_id (match_id),
  INDEX idx_ngo_id (ngo_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- If organisation_food already exists without freshness columns, run:
-- ALTER TABLE organisation_food ADD COLUMN freshness_score INT NULL, ADD COLUMN quality_score INT NULL;
-- If organisation_food exists with ngo_id NOT NULL only, allow donor (restaurant) food:
-- ALTER TABLE organisation_food MODIFY ngo_id INT NULL;
-- ALTER TABLE organisation_food ADD COLUMN restaurant_id INT NULL;
-- ALTER TABLE organisation_food ADD CONSTRAINT fk_of_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
-- ALTER TABLE organisation_food ADD INDEX idx_restaurant_id (restaurant_id);
