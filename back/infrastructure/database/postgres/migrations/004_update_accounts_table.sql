-- Migration: Update accounts table to match current schema
-- Date: 2025-01-XX
-- This migration ensures the accounts table has all required columns matching the Account entity

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'EUR';

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS iban VARCHAR(34);

UPDATE accounts 
SET iban = 'TEMP-' || id || '-' || EXTRACT(EPOCH FROM NOW())::text
WHERE iban IS NULL;

ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_iban_unique;
ALTER TABLE accounts ALTER COLUMN iban SET NOT NULL;
ALTER TABLE accounts ADD CONSTRAINT accounts_iban_unique UNIQUE (iban);

CREATE INDEX IF NOT EXISTS idx_accounts_iban ON accounts(iban);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS card_number VARCHAR(16) UNIQUE;

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS card_holder_name VARCHAR(255);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS card_expiry_date VARCHAR(5);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS card_cvv VARCHAR(3);

ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS saving_rate_id VARCHAR(255);

ALTER TABLE accounts
    DROP CONSTRAINT IF EXISTS fk_accounts_saving_rate;

ALTER TABLE accounts
    ADD CONSTRAINT fk_accounts_saving_rate
    FOREIGN KEY (saving_rate_id) REFERENCES saving_rates(id) ON DELETE SET NULL;

UPDATE accounts SET type = 'CURRENT' WHERE type = 'CHECKING';
UPDATE accounts SET type = 'SAVINGS' WHERE type = 'INVESTMENT';

ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;

ALTER TABLE accounts ADD CONSTRAINT accounts_type_check
    CHECK (type IN ('CURRENT', 'SAVINGS'));
