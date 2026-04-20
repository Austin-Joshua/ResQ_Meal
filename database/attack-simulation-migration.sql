-- Threat attack simulation module
-- Main DB tables + backup schema/table for clean snapshots

CREATE TABLE IF NOT EXISTS attack_sim_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payload VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'CLEAN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attack_simulation_state (
  id INT PRIMARY KEY,
  security_mode_on BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO attack_simulation_state (id, security_mode_on)
VALUES (1, TRUE)
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS attack_simulation_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  actor VARCHAR(128) NULL,
  details VARCHAR(1024) NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_event_action (event_type, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE SCHEMA IF NOT EXISTS resqmeal_backup;

CREATE TABLE IF NOT EXISTS resqmeal_backup.attack_sim_records_backup (
  id BIGINT PRIMARY KEY,
  payload VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
