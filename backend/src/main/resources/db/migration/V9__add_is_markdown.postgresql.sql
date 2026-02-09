ALTER TABLE threads
    ADD COLUMN IF NOT EXISTS is_markdown boolean NOT NULL DEFAULT false;

ALTER TABLE entries
    ADD COLUMN IF NOT EXISTS is_markdown boolean NOT NULL DEFAULT false;
