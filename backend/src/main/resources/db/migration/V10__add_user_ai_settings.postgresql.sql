ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ai_provider varchar(50);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ai_api_key_encrypted text;
