SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================================
-- ORDRES BID (ACHATS) - AAPL
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_aapl_1',
    'stock_1',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  -- Sophie Dubois
    'BID',
    'LIMIT',
    10.00,
    10.00,
    191.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    NOW()
),
(
    'ob_bid_aapl_2',
    'stock_1',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',  -- Lucas Petit
    'BID',
    'LIMIT',
    5.00,
    5.00,
    191.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 25 MINUTE),
    NOW()
),
(
    'ob_bid_aapl_3',
    'stock_1',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',  -- Emma Moreau
    'BID',
    'LIMIT',
    20.00,
    15.00,
    190.50,
    NULL,
    'PARTIAL',
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    NOW()
);

-- =========================================
-- ORDRES ASK (VENTES) - AAPL
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_ask_aapl_1',
    'stock_1',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',  -- Hugo Laurent
    'ASK',
    'LIMIT',
    8.00,
    8.00,
    192.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    NOW()
),
(
    'ob_ask_aapl_2',
    'stock_1',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',  -- Léa Simon
    'ASK',
    'LIMIT',
    15.00,
    15.00,
    193.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    NOW()
),
(
    'ob_ask_aapl_stop',
    'stock_1',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',  -- Léa Simon
    'ASK',
    'STOP',
    5.00,
    5.00,
    NULL,
    185.00,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 10 MINUTE),
    NOW()
);

-- =========================================
-- ORDRES HUGO LAURENT - AAPL (LIMIT BUY & SELL)
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
-- LIMIT BUY orders (Hugo veut acheter à des prix plus bas)
(
    'ob_hugo_bid_aapl_1',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'BID',
    'LIMIT',
    50.00,
    50.00,
    190.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    NOW()
),
(
    'ob_hugo_bid_aapl_2',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'BID',
    'LIMIT',
    100.00,
    100.00,
    188.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    NOW()
),
(
    'ob_hugo_bid_aapl_3',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'BID',
    'LIMIT',
    75.00,
    75.00,
    185.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 3 HOUR),
    NOW()
),
-- LIMIT SELL orders (Hugo veut vendre à des prix plus hauts)
(
    'ob_hugo_ask_aapl_1',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'ASK',
    'LIMIT',
    100.00,
    100.00,
    195.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 90 MINUTE),
    NOW()
),
(
    'ob_hugo_ask_aapl_2',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'ASK',
    'LIMIT',
    150.00,
    150.00,
    197.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    NOW()
),
(
    'ob_hugo_ask_aapl_3',
    'stock_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',  -- Hugo Laurent
    'ASK',
    'LIMIT',
    200.00,
    200.00,
    200.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 4 HOUR),
    NOW()
);

-- =========================================
-- ORDRES - GOOGL
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_googl_1',
    'stock_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  -- Sophie Dubois
    'BID',
    'LIMIT',
    12.00,
    12.00,
    175.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    NOW()
),
(
    'ob_ask_googl_1',
    'stock_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',  -- Marie Martin
    'ASK',
    'LIMIT',
    10.00,
    10.00,
    175.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 40 MINUTE),
    NOW()
),
(
    'ob_system_ask_googl_1',
    'stock_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',  -- Marie Martin
    'ASK',
    'LIMIT',
    3750.00,
    3750.00,
    175.40,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    NOW()
),
(
    'ob_system_ask_googl_2',
    'stock_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  -- Sophie Dubois
    'ASK',
    'LIMIT',
    3750.00,
    3750.00,
    175.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 3 HOUR),
    NOW()
);

-- =========================================
-- ORDRES - NVDA
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_nvda_1',
    'stock_7',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',  -- Emma Moreau
    'BID',
    'LIMIT',
    25.00,
    25.00,
    146.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    NOW()
),
(
    'ob_ask_nvda_1',
    'stock_7',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',  -- Pierre Durand (Director)
    'ASK',
    'LIMIT',
    18.00,
    18.00,
    147.50,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    NOW()
);

-- =========================================
-- ORDRES - TSLA
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_tsla_1',
    'stock_6',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',  -- Lucas Petit
    'BID',
    'LIMIT',
    15.00,
    15.00,
    244.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 50 MINUTE),
    NOW()
),
(
    'ob_ask_tsla_1',
    'stock_6',
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',  -- Thomas Bernard
    'ASK',
    'LIMIT',
    10.00,
    10.00,
    246.00,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 28 MINUTE),
    NOW()
);

-- =========================================
-- ORDRES - META
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_meta_1',
    'stock_5',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'BID',
    'LIMIT',
    2.50,
    0.00,
    512.00,
    NULL,
    'FILLED',
    DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    NOW()
),
(
    'ob_ask_meta_1',
    'stock_5',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'ASK',
    'LIMIT',
    2.50,
    0.00,
    512.50,
    NULL,
    'FILLED',
    DATE_SUB(NOW(), INTERVAL 35 MINUTE),
    NOW()
);

-- =========================================
-- ORDRES - AMD
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_bid_amd_1',
    'stock_9',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'BID',
    'LIMIT',
    8.00,
    0.00,
    162.00,
    NULL,
    'FILLED',
    DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    NOW()
),
(
    'ob_ask_amd_1',
    'stock_9',
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',
    'ASK',
    'LIMIT',
    8.00,
    0.00,
    162.50,
    NULL,
    'FILLED',
    DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    NOW()
);

-- =========================================
-- ORDRES MARKET (exécution immédiate)
-- =========================================

INSERT IGNORE INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
(
    'ob_market_msft_1',
    'stock_3',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'BID',
    'MARKET',
    5.00,
    5.00,
    NULL,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 5 MINUTE),
    NOW()
);

-- Vérification du carnet d'ordres
SELECT
    s.symbol,
    ob.side,
    ob.order_type,
    COUNT(*) as total_orders,
    SUM(ob.remaining_quantity) as total_quantity,
    AVG(ob.limit_price) as avg_price
FROM order_book ob
JOIN stocks s ON ob.stock_id = s.id
WHERE ob.state IN ('PENDING', 'PARTIAL')
GROUP BY s.symbol, ob.side, ob.order_type
ORDER BY s.symbol, ob.side;
