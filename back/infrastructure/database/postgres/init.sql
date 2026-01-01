CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    identity_number VARCHAR(50) UNIQUE NOT NULL,
    passcode VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('DIRECTOR', 'ADVISOR', 'CLIENT')),
    state VARCHAR(50) NOT NULL CHECK (state IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table SavingRates (must be created before accounts)
CREATE TABLE IF NOT EXISTS saving_rates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (name IN ('STANDARD', 'PREMIUM', 'GOLD')),
    rate DECIMAL(5, 2) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CURRENT', 'SAVINGS')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    account_id VARCHAR(255) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Loans
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Stocks (actions boursières) - must be created before orders
CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(255) PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    isin VARCHAR(12) UNIQUE,
    current_price DECIMAL(15, 2) NOT NULL,
    best_bid DECIMAL(15, 2),
    best_ask DECIMAL(15, 2),
    market_cap BIGINT,
    volume_24h BIGINT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Orders (DEPRECATED - use order_book instead)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id VARCHAR(255) REFERENCES stocks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'EXECUTED', 'CANCELLED', 'FAILED')),
    asset_name VARCHAR(255),
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Chats
CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advisor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'CLOSED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table User Actions (historique des actions utilisateur - audit log)
CREATE TABLE IF NOT EXISTS user_actions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Portfolios (portefeuilles d'investissement)
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id VARCHAR(255) NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 8) NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(15, 2) NOT NULL,
    total_invested DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stock_id)
);

-- Table Order Book (carnet d'ordres)
CREATE TABLE IF NOT EXISTS order_book (
    id VARCHAR(255) PRIMARY KEY,
    stock_id VARCHAR(255) NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BID', 'ASK')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP')),
    quantity DECIMAL(15, 8) NOT NULL,
    remaining_quantity DECIMAL(15, 8) NOT NULL,
    limit_price DECIMAL(15, 2),
    stop_price DECIMAL(15, 2),
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'PARTIAL', 'FILLED', 'CANCELLED', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table Trades (transactions exécutées)
CREATE TABLE IF NOT EXISTS trades (
    id VARCHAR(255) PRIMARY KEY,
    stock_id VARCHAR(255) NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    buyer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buy_order_id VARCHAR(255) NOT NULL REFERENCES order_book(id) ON DELETE CASCADE,
    sell_order_id VARCHAR(255) NOT NULL REFERENCES order_book(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    buyer_fee DECIMAL(15, 2) NOT NULL DEFAULT 1.00,
    seller_fee DECIMAL(15, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chats_advisor_id ON chats(advisor_id);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_is_active ON stocks(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_stock_id ON portfolios(stock_id);
CREATE INDEX IF NOT EXISTS idx_order_book_stock_id ON order_book(stock_id);
CREATE INDEX IF NOT EXISTS idx_order_book_user_id ON order_book(user_id);
CREATE INDEX IF NOT EXISTS idx_order_book_side_state ON order_book(side, state);
CREATE INDEX IF NOT EXISTS idx_trades_stock_id ON trades(stock_id);
CREATE INDEX IF NOT EXISTS idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller_id ON trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saving_rates_updated_at BEFORE UPDATE ON saving_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_book_updated_at BEFORE UPDATE ON order_book
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO saving_rates (id, name, rate, min_amount, description)
VALUES 
    ('sr1', 'STANDARD', 2.5, 0, 'Taux d''épargne standard pour tous'),
    ('sr2', 'PREMIUM', 3.5, 10000, 'Taux d''épargne premium pour les dépôts supérieurs à 10 000€'),
    ('sr3', 'GOLD', 4.5, 50000, 'Taux d''épargne gold pour les dépôts supérieurs à 50 000€')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE users IS 'Table des utilisateurs de l''application';
COMMENT ON TABLE accounts IS 'Table des comptes bancaires';
COMMENT ON TABLE transactions IS 'Table des transactions bancaires';
COMMENT ON TABLE loans IS 'Table des prêts';
COMMENT ON TABLE orders IS 'Table des ordres d''investissement';
COMMENT ON TABLE chats IS 'Table des conversations de chat';
COMMENT ON TABLE messages IS 'Table des messages de chat';
COMMENT ON TABLE saving_rates IS 'Table des taux d''épargne';
COMMENT ON TABLE user_actions IS 'Table de l''historique des actions utilisateur (audit log)';
COMMENT ON TABLE stocks IS 'Table des actions boursières disponibles';
COMMENT ON TABLE portfolios IS 'Table des portefeuilles d''investissement des utilisateurs';
COMMENT ON TABLE order_book IS 'Table du carnet d''ordres (BID/ASK)';
COMMENT ON TABLE trades IS 'Table des transactions boursières exécutées';

-- =====================================================
-- FIXTURES
-- =====================================================
-- Les fixtures sont maintenant dans des fichiers séparés :
-- - fixtures/stocks_fixtures.sql
-- - fixtures/portfolios_fixtures.sql
-- - fixtures/order_book_fixtures.sql
-- - fixtures/trades_fixtures.sql
-- - fixtures/user_actions_fixtures.sql
--
-- Pour charger les fixtures :
-- psql -U postgres -d avenir_db -f fixtures/stocks_fixtures.sql
-- psql -U postgres -d avenir_db -f fixtures/portfolios_fixtures.sql
-- etc.

