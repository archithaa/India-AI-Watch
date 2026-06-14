CREATE TABLE IF NOT EXISTS subscribers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  confirmed   boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (email);
