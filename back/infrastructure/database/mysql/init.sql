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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table SavingRates (must be created before accounts)
CREATE TABLE IF NOT EXISTS saving_rates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (name IN ('STANDARD', 'PREMIUM', 'GOLD')),
    rate DECIMAL(5, 2) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CURRENT', 'SAVINGS')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_accounts_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    account_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_transactions_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Loans
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loans_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stocks_symbol (symbol),
    INDEX idx_stocks_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Orders (DEPRECATED - use order_book instead)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stock_id VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'EXECUTED', 'CANCELLED', 'FAILED')),
    asset_name VARCHAR(255),
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    INDEX idx_orders_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Chats
CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    advisor_id VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'CLOSED')) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_chats_client_id (client_id),
    INDEX idx_chats_advisor_id (advisor_id),
    INDEX idx_chats_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_chat_id (chat_id),
    INDEX idx_messages_sender_id (sender_id),
    INDEX idx_messages_is_read (is_read),
    INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table User Actions (historique des actions utilisateur - audit log)
CREATE TABLE IF NOT EXISTS user_actions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_actions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Portfolios (portefeuilles d'investissement)
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    stock_id VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(15, 2) NOT NULL,
    total_invested DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_stock (user_id, stock_id),
    INDEX idx_portfolios_user_id (user_id),
    INDEX idx_portfolios_stock_id (stock_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Order Book (carnet d'ordres)
CREATE TABLE IF NOT EXISTS order_book (
    id VARCHAR(255) PRIMARY KEY,
    stock_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BID', 'ASK')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP')),
    quantity DECIMAL(15, 8) NOT NULL,
    remaining_quantity DECIMAL(15, 8) NOT NULL,
    limit_price DECIMAL(15, 2),
    stop_price DECIMAL(15, 2),
    state VARCHAR(50) NOT NULL CHECK (state IN ('PENDING', 'PARTIAL', 'FILLED', 'CANCELLED', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_book_stock_id (stock_id),
    INDEX idx_order_book_user_id (user_id),
    INDEX idx_order_book_side_state (side, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Trades (transactions exécutées)
CREATE TABLE IF NOT EXISTS trades (
    id VARCHAR(255) PRIMARY KEY,
    stock_id VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255) NOT NULL,
    buy_order_id VARCHAR(255) NOT NULL,
    sell_order_id VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 8) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    buyer_fee DECIMAL(15, 2) NOT NULL DEFAULT 1.00,
    seller_fee DECIMAL(15, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buy_order_id) REFERENCES order_book(id) ON DELETE CASCADE,
    FOREIGN KEY (sell_order_id) REFERENCES order_book(id) ON DELETE CASCADE,
    INDEX idx_trades_stock_id (stock_id),
    INDEX idx_trades_buyer_id (buyer_id),
    INDEX idx_trades_seller_id (seller_id),
    INDEX idx_trades_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index supplémentaire pour optimisation
CREATE INDEX idx_users_email ON users(email);

INSERT IGNORE INTO saving_rates (id, name, rate, min_amount, description)
VALUES
    ('sr1', 'STANDARD', 2.5, 0, 'Taux d\'épargne standard pour tous'),
    ('sr2', 'PREMIUM', 3.5, 10000, 'Taux d\'épargne premium pour les dépôts supérieurs à 10 000€'),
    ('sr3', 'GOLD', 4.5, 50000, 'Taux d\'épargne gold pour les dépôts supérieurs à 50 000€');

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
-- mysql -u root -p avenir_db < fixtures/stocks_fixtures.sql
-- mysql -u root -p avenir_db < fixtures/portfolios_fixtures.sql
-- etc.

