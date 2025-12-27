-- Migration: Update accounts table to match current schema
-- Date: 2025-01-XX
-- This migration ensures the accounts table has all required columns matching the Account entity

-- Add currency column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'currency');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT ''EUR''', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add iban column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'iban');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN iban VARCHAR(34) UNIQUE', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add name column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'name');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN name VARCHAR(255)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add card_number column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'card_number');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN card_number VARCHAR(16) UNIQUE', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add card_holder_name column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'card_holder_name');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN card_holder_name VARCHAR(255)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add card_expiry_date column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'card_expiry_date');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN card_expiry_date VARCHAR(5)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add card_cvv column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'card_cvv');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN card_cvv VARCHAR(3)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add saving_rate_id column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND COLUMN_NAME = 'saving_rate_id');
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE accounts ADD COLUMN saving_rate_id VARCHAR(255)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint for saving_rate_id if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND CONSTRAINT_NAME = 'fk_accounts_saving_rate');
SET @sql = IF(@fk_exists = 0, 
  'ALTER TABLE accounts ADD CONSTRAINT fk_accounts_saving_rate FOREIGN KEY (saving_rate_id) REFERENCES saving_rates(id) ON DELETE SET NULL', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update type check constraint (ensures CURRENT and SAVINGS are the only allowed values)
SET @check_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND CONSTRAINT_NAME = 'accounts_chk_1');
SET @sql = IF(@check_exists > 0, 
  'ALTER TABLE accounts DROP CHECK accounts_chk_1', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add accounts_type_check constraint if it doesn't exist
SET @check_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND CONSTRAINT_NAME = 'accounts_type_check');
SET @sql = IF(@check_exists = 0, 
  'ALTER TABLE accounts ADD CONSTRAINT accounts_type_check CHECK (type IN (''CURRENT'', ''SAVINGS''))', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for IBAN lookups if it doesn't exist
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'accounts' 
  AND INDEX_NAME = 'idx_accounts_iban');
SET @sql = IF(@index_exists = 0, 
  'CREATE INDEX idx_accounts_iban ON accounts(iban)', 
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing data: CHECKING -> CURRENT, INVESTMENT -> SAVINGS (if any exist)
UPDATE accounts SET type = 'CURRENT' WHERE type = 'CHECKING';
UPDATE accounts SET type = 'SAVINGS' WHERE type = 'INVESTMENT';
