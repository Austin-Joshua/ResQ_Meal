-- Security monitoring tables (safe to run on an existing DB that already has the main schema)
-- If you created the DB from database/database.sql after these were added, you do not need this file.

CREATE TABLE IF NOT EXISTS security_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) NULL,
  ip_address VARCHAR(64) NOT NULL,
  action VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  details VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_critical (is_critical, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blocked_entities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) NULL,
  ip_address VARCHAR(64) NULL,
  reason VARCHAR(512) NULL,
  blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_known_ips (
  user_id VARCHAR(64) NOT NULL,
  ip_address VARCHAR(64) NOT NULL,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, ip_address),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS traffic_threat_ml_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) NULL,
  ip_address VARCHAR(64) NOT NULL,
  http_method VARCHAR(16) NOT NULL,
  path VARCHAR(512) NOT NULL,
  label VARCHAR(32) NOT NULL,
  confidence DOUBLE NOT NULL,
  attack_families VARCHAR(512) NULL,
  details VARCHAR(1024) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_label (label, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
