CREATE TABLE IF NOT EXISTS gifts (
  gift_id TEXT PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  occasion TEXT NOT NULL DEFAULT '',
  coin TEXT NOT NULL,
  amount_display TEXT NOT NULL,
  message_from_you TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'unopened' CHECK (status IN ('unopened', 'claimed', 'sent')),
  wallet_address TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gifts_status_idx ON gifts (status);
CREATE INDEX IF NOT EXISTS gifts_created_at_idx ON gifts (created_at DESC);
