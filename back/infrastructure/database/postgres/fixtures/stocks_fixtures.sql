SET client_encoding = 'UTF8';

-- =========================================
-- STOCKS TECH (7)
-- =========================================

INSERT INTO stocks (id, symbol, name, isin, current_price, best_bid, best_ask, market_cap, volume_24h, is_active, created_at, updated_at)
VALUES
(
    'stock_1',
    'AAPL',
    'Apple Inc.',
    'US0378331005',
    192.00,
    191.95,
    192.05,
    3000000000000,
    125000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_2',
    'GOOGL',
    'Alphabet Inc.',
    'US02079K3059',
    175.30,
    175.25,
    175.35,
    2200000000000,
    89000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_3',
    'MSFT',
    'Microsoft Corp.',
    'US5949181045',
    428.50,
    428.40,
    428.60,
    3200000000000,
    156000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_5',
    'META',
    'Meta Platforms Inc.',
    'US30303M1027',
    512.85,
    512.75,
    512.95,
    1300000000000,
    67000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_7',
    'NVDA',
    'NVIDIA Corp.',
    'US67066G1040',
    147.00,
    146.95,
    147.10,
    3600000000000,
    234000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_8',
    'NFLX',
    'Netflix Inc.',
    'US64110L1061',
    685.20,
    685.00,
    685.40,
    295000000000,
    45000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_9',
    'AMD',
    'Advanced Micro Devices',
    'US0079031078',
    162.90,
    162.85,
    163.00,
    263000000000,
    78000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STOCKS E-COMMERCE & TRANSPORT (3)
-- =========================================

INSERT INTO stocks (id, symbol, name, isin, current_price, best_bid, best_ask, market_cap, volume_24h, is_active, created_at, updated_at)
VALUES
(
    'stock_4',
    'AMZN',
    'Amazon.com Inc.',
    'US0231351067',
    191.00,
    190.95,
    191.10,
    1980000000000,
    98000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_11',
    'ABNB',
    'Airbnb Inc.',
    'US0090661010',
    141.00,
    140.95,
    141.10,
    90000000000,
    28000,
    true,
    NOW() - INTERVAL '4 months',
    NOW()
),
(
    'stock_12',
    'UBER',
    'Uber Technologies Inc.',
    'US90353T1007',
    78.40,
    78.35,
    78.50,
    157000000000,
    52000,
    true,
    NOW() - INTERVAL '4 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- STOCKS AUTRES SECTEURS (2)
-- =========================================

INSERT INTO stocks (id, symbol, name, isin, current_price, best_bid, best_ask, market_cap, volume_24h, is_active, created_at, updated_at)
VALUES
(
    'stock_6',
    'TSLA',
    'Tesla Inc.',
    'US88160R1014',
    245.00,
    244.90,
    245.15,
    778000000000,
    145000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
),
(
    'stock_10',
    'DIS',
    'The Walt Disney Company',
    'US2546871060',
    93.75,
    93.70,
    93.80,
    171000000000,
    34000,
    true,
    NOW() - INTERVAL '6 months',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Vérification
SELECT COUNT(*) as total_stocks FROM stocks WHERE is_active = true;
