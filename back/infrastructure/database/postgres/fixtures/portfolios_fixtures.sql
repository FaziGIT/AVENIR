SET client_encoding = 'UTF8';

-- =========================================
-- PORTFOLIO DIRECTEUR (Pierre Durand)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_dir_1',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'stock_1',  -- AAPL
    100.00,
    180.00,
    18000.00,
    NOW() - INTERVAL '5 months',
    NOW()
),
(
    'pf_dir_2',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'stock_3',  -- MSFT
    50.00,
    400.00,
    20000.00,
    NOW() - INTERVAL '4 months',
    NOW()
),
(
    'pf_dir_3',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'stock_7',  -- NVDA
    75.00,
    130.00,
    9750.00,
    NOW() - INTERVAL '3 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CONSEILLER 1 (Marie Martin)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_adv1_1',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'stock_2',  -- GOOGL
    30.00,
    165.00,
    4950.00,
    NOW() - INTERVAL '2 months',
    NOW()
),
(
    'pf_adv1_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'stock_5',  -- META
    10.00,
    480.00,
    4800.00,
    NOW() - INTERVAL '6 weeks',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CONSEILLER 2 (Thomas Bernard)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_adv2_1',
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',
    'stock_6',  -- TSLA
    25.00,
    220.00,
    5500.00,
    NOW() - INTERVAL '10 weeks',
    NOW()
),
(
    'pf_adv2_2',
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',
    'stock_9',  -- AMD
    40.00,
    145.00,
    5800.00,
    NOW() - INTERVAL '2 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CLIENT 1 (Sophie Dubois)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_cli1_1',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'stock_1',  -- AAPL
    50.00,
    185.50,
    9275.00,
    NOW() - INTERVAL '3 months',
    NOW()
),
(
    'pf_cli1_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'stock_2',  -- GOOGL
    25.00,
    170.00,
    4250.00,
    NOW() - INTERVAL '2 months',
    NOW()
),
(
    'pf_cli1_3',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'stock_7',  -- NVDA
    30.00,
    140.00,
    4200.00,
    NOW() - INTERVAL '1 month',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CLIENT 2 (Lucas Petit)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_cli2_1',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'stock_1',  -- AAPL
    35.50,
    188.00,
    6674.00,
    NOW() - INTERVAL '2 months',
    NOW()
),
(
    'pf_cli2_2',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'stock_5',  -- META
    8.00,
    495.00,
    3960.00,
    NOW() - INTERVAL '1 month',
    NOW()
),
(
    'pf_cli2_3',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'stock_3',  -- MSFT
    12.00,
    410.00,
    4920.00,
    NOW() - INTERVAL '3 weeks',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CLIENT 3 (Emma Moreau)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_cli3_1',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'stock_6',  -- TSLA
    20.00,
    230.00,
    4600.00,
    NOW() - INTERVAL '6 weeks',
    NOW()
),
(
    'pf_cli3_2',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'stock_4',  -- AMZN
    15.00,
    180.00,
    2700.00,
    NOW() - INTERVAL '1 month',
    NOW()
),
(
    'pf_cli3_3',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'stock_8',  -- NFLX
    5.00,
    650.00,
    3250.00,
    NOW() - INTERVAL '2 weeks',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CLIENT 4 (Hugo Laurent)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_cli4_1',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'stock_7',  -- NVDA
    40.00,
    135.00,
    5400.00,
    NOW() - INTERVAL '4 months',
    NOW()
),
(
    'pf_cli4_2',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'stock_9',  -- AMD
    25.00,
    155.00,
    3875.00,
    NOW() - INTERVAL '2 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO CLIENT 5 (Léa Simon)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_cli5_1',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'stock_1',  -- AAPL
    28.00,
    190.00,
    5320.00,
    NOW() - INTERVAL '5 weeks',
    NOW()
),
(
    'pf_cli5_2',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'stock_10',  -- DIS
    50.00,
    88.00,
    4400.00,
    NOW() - INTERVAL '3 weeks',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- PORTFOLIO Hugo Laurent (d2e5f6a4)
-- =========================================

INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
VALUES
(
    'pf_hugo_1',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'stock_1',  -- AAPL
    2000.00,
    175.50,
    351000.00,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'pf_hugo_2',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'stock_11',  -- ABNB (Airbnb)
    85.00,
    135.00,
    11475.00,
    NOW() - INTERVAL '4 months',
    NOW()
),
(
    'pf_hugo_3',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'stock_7',  -- NVDA
    60.00,
    128.00,
    7680.00,
    NOW() - INTERVAL '3 months',
    NOW()
),
(
    'pf_hugo_4',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'stock_4',  -- AMZN
    45.00,
    178.00,
    8010.00,
    NOW() - INTERVAL '2 months',
    NOW()
),
(
    'pf_hugo_5',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'stock_2',  -- GOOGL
    15000.00,
    168.00,
    2520000.00,
    NOW() - INTERVAL '1 month',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT
    u.first_name || ' ' || u.last_name as user_name,
    COUNT(p.id) as total_positions,
    SUM(p.total_invested) as total_invested,
    SUM(p.quantity * s.current_price) as current_value,
    SUM(p.quantity * s.current_price) - SUM(p.total_invested) as profit_loss
FROM portfolios p
JOIN users u ON p.user_id = u.id
JOIN stocks s ON p.stock_id = s.id
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_invested DESC;
