-- Notifications table for in-app real-time notifications (unread count, list).
-- Run once: mysql -u root -p resqmeal_db < backend/config/notifications-migration.sql
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(32) NOT NULL COMMENT 'food_posted, match_created, match_accepted, match_picked_up, match_delivered',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(512) NULL COMMENT 'e.g. /matches/123 or #post',
  ref_id INT NULL COMMENT 'match_id or food_post_id',
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, read_at),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
