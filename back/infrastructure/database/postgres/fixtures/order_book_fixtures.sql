SET client_encoding = 'UTF8';

-- =========================================
-- ORDRES BID (ACHATS) - AAPL
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '30 minutes',
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
    NOW() - INTERVAL '25 minutes',
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
    NOW() - INTERVAL '1 hour',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES ASK (VENTES) - AAPL
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '20 minutes',
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
    NOW() - INTERVAL '15 minutes',
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
    NOW() - INTERVAL '10 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES HUGO LAURENT - AAPL (LIMIT BUY & SELL)
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '2 hours',
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
    NOW() - INTERVAL '1 hour',
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
    NOW() - INTERVAL '3 hours',
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
    NOW() - INTERVAL '90 minutes',
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
    NOW() - INTERVAL '2 hours',
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
    NOW() - INTERVAL '4 hours',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES - GOOGL
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '45 minutes',
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
    NOW() - INTERVAL '40 minutes',
    NOW()
),
(
    'ob_system_ask_googl_1',
    'stock_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',  -- Marie Martin
    'ASK',
    'LIMIT',
    1000.00,
    1000.00,
    176.00,
    NULL,
    'PENDING',
    NOW() - INTERVAL '2 hours',
    NOW()
),
(
    'ob_system_ask_googl_2',
    'stock_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  -- Sophie Dubois
    'ASK',
    'LIMIT',
    500.00,
    500.00,
    176.50,
    NULL,
    'PENDING',
    NOW() - INTERVAL '3 hours',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES - NVDA
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '35 minutes',
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
    NOW() - INTERVAL '30 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES - TSLA
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '50 minutes',
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
    NOW() - INTERVAL '28 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES - META
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '35 minutes',
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
    NOW() - INTERVAL '35 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES - AMD
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '20 minutes',
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
    NOW() - INTERVAL '20 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES MARKET (exécution immédiate)
-- =========================================

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
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
    NOW() - INTERVAL '5 minutes',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES SYSTÈME ASK (Liquidité pour ACHETER)
-- =========================================
-- Ces ordres permettent aux utilisateurs d'acheter immédiatement au prix du marché

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
-- AAPL - Apple Inc.
('ob_system_ask_aapl', 'stock_1', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 192.00, NULL, 'PENDING', NOW(), NOW()),

-- GOOGL - Alphabet Inc.
('ob_system_ask_googl', 'stock_2', 'SYSTEM', 'ASK', 'LIMIT', 7500.00, 7500.00, 175.40, NULL, 'PENDING', NOW(), NOW()),

-- MSFT - Microsoft Corporation
('ob_system_ask_msft', 'stock_3', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 420.50, NULL, 'PENDING', NOW(), NOW()),

-- AMZN - Amazon.com Inc.
('ob_system_ask_amzn', 'stock_4', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 178.30, NULL, 'PENDING', NOW(), NOW()),

-- META - Meta Platforms Inc.
('ob_system_ask_meta', 'stock_5', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 512.75, NULL, 'PENDING', NOW(), NOW()),

-- TSLA - Tesla Inc.
('ob_system_ask_tsla', 'stock_6', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 245.10, NULL, 'PENDING', NOW(), NOW()),

-- NVDA - NVIDIA Corporation
('ob_system_ask_nvda', 'stock_7', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 147.00, NULL, 'PENDING', NOW(), NOW()),

-- NFLX - Netflix Inc.
('ob_system_ask_nflx', 'stock_8', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 685.20, NULL, 'PENDING', NOW(), NOW()),

-- AMD - Advanced Micro Devices Inc.
('ob_system_ask_amd', 'stock_9', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 162.25, NULL, 'PENDING', NOW(), NOW()),

-- DIS - The Walt Disney Company
('ob_system_ask_dis', 'stock_10', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 95.80, NULL, 'PENDING', NOW(), NOW()),

-- ABNB - Airbnb Inc.
('ob_system_ask_abnb', 'stock_11', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 134.50, NULL, 'PENDING', NOW(), NOW()),

-- UBER - Uber Technologies Inc.
('ob_system_ask_uber', 'stock_12', 'SYSTEM', 'ASK', 'LIMIT', 1000.00, 1000.00, 68.40, NULL, 'PENDING', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ORDRES SYSTÈME BID (Liquidité pour VENDRE)
-- =========================================
-- Ces ordres permettent aux utilisateurs de vendre immédiatement au prix du marché

INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
VALUES
-- AAPL - Apple Inc. (légèrement sous le prix ASK)
('ob_system_bid_aapl', 'stock_1', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 191.00, NULL, 'PENDING', NOW(), NOW()),

-- GOOGL - Alphabet Inc.
('ob_system_bid_googl', 'stock_2', 'SYSTEM', 'BID', 'LIMIT', 7500.00, 7500.00, 175.20, NULL, 'PENDING', NOW(), NOW()),

-- MSFT - Microsoft Corporation
('ob_system_bid_msft', 'stock_3', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 419.50, NULL, 'PENDING', NOW(), NOW()),

-- AMZN - Amazon.com Inc.
('ob_system_bid_amzn', 'stock_4', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 177.30, NULL, 'PENDING', NOW(), NOW()),

-- META - Meta Platforms Inc.
('ob_system_bid_meta', 'stock_5', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 511.75, NULL, 'PENDING', NOW(), NOW()),

-- TSLA - Tesla Inc.
('ob_system_bid_tsla', 'stock_6', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 244.10, NULL, 'PENDING', NOW(), NOW()),

-- NVDA - NVIDIA Corporation
('ob_system_bid_nvda', 'stock_7', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 146.00, NULL, 'PENDING', NOW(), NOW()),

-- NFLX - Netflix Inc.
('ob_system_bid_nflx', 'stock_8', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 684.20, NULL, 'PENDING', NOW(), NOW()),

-- AMD - Advanced Micro Devices Inc.
('ob_system_bid_amd', 'stock_9', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 161.25, NULL, 'PENDING', NOW(), NOW()),

-- DIS - The Walt Disney Company
('ob_system_bid_dis', 'stock_10', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 94.80, NULL, 'PENDING', NOW(), NOW()),

-- ABNB - Airbnb Inc.
('ob_system_bid_abnb', 'stock_11', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 133.50, NULL, 'PENDING', NOW(), NOW()),

-- UBER - Uber Technologies Inc.
('ob_system_bid_uber', 'stock_12', 'SYSTEM', 'BID', 'LIMIT', 1000.00, 1000.00, 67.40, NULL, 'PENDING', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

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
