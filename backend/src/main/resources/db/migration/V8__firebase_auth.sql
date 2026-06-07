-- Google / Firebase OAuth: link accounts by Firebase UID; password optional for OAuth-only users
ALTER TABLE users
  ADD COLUMN firebase_uid VARCHAR(128) NULL UNIQUE AFTER email,
  MODIFY COLUMN password VARCHAR(255) NULL;

CREATE INDEX idx_firebase_uid ON users (firebase_uid);
