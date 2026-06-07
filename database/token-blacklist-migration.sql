-- JWT logout token blacklist (safe to run on an existing DB)

CREATE TABLE IF NOT EXISTS token_blacklist (
  token_hash VARCHAR(64) PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
