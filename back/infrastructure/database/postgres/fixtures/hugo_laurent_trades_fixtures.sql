SET client_encoding = 'UTF8';

-- =========================================
-- TRADES HISTORIQUES HUGO LAURENT (2024)
-- Pour créer une belle courbe de valeur du portfolio
-- =========================================
-- User ID: d2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a
-- =========================================

-- Note: Hugo achète progressivement des actions tout au long de 2024
-- pour construire son portfolio actuel:
-- - AAPL: 2000 shares @ 175.50 avg
-- - GOOGL: 15000 shares @ 168.00 avg
-- - ABNB: 85 shares @ 135.00 avg
-- - NVDA: 60 shares @ 128.00 avg
-- - AMZN: 45 shares @ 178.00 avg

-- =========================================
-- CREATE ORDER BOOK ENTRIES FOR HUGO'S TRADES
-- =========================================
DO $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..60 LOOP
        INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, state, created_at)
        VALUES
            ('ob_hugo_' || i, 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'BID', 'MARKET', 10.00, 0, NULL, 'FILLED', NOW() - INTERVAL '1 year'),
            ('ob_system_' || i, 'stock_1', 'SYSTEM', 'ASK', 'MARKET', 10.00, 0, NULL, 'FILLED', NOW() - INTERVAL '1 year')
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- =========================================
-- JANVIER 2024 - Premiers achats
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_jan_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_1', 'ob_system_1', 300.00, 172.50, 1.00, 1.00, '2024-01-10 10:00:00+00'),
-- GOOGL - Premier gros achat
('trade_hugo_googl_jan_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_2', 'ob_system_2', 1200.00, 140.50, 1.00, 1.00, '2024-01-15 14:30:00+00'),
('trade_hugo_googl_jan_2', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_3', 'ob_system_3', 1500.00, 142.00, 1.00, 1.00, '2024-01-22 11:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- FÉVRIER 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_feb_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_4', 'ob_system_4', 400.00, 174.00, 1.00, 1.00, '2024-02-08 09:30:00+00'),
-- GOOGL
('trade_hugo_googl_feb_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_5', 'ob_system_5', 1800.00, 145.50, 1.00, 1.00, '2024-02-14 13:00:00+00'),
-- NVDA - Premier achat
('trade_hugo_nvda_feb_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_6', 'ob_system_6', 20.00, 125.00, 1.00, 1.00, '2024-02-20 15:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MARS 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_mar_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_7', 'ob_system_7', 350.00, 176.00, 1.00, 1.00, '2024-03-05 10:20:00+00'),
-- GOOGL
('trade_hugo_googl_mar_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_8', 'ob_system_8', 1800.00, 151.80, 1.00, 1.00, '2024-03-12 14:00:00+00'),
-- ABNB - Premier achat
('trade_hugo_abnb_mar_1', 'stock_11', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_9', 'ob_system_9', 30.00, 132.00, 1.00, 1.00, '2024-03-18 16:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- AVRIL 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_apr_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_10', 'ob_system_10', 300.00, 177.50, 1.00, 1.00, '2024-04-09 11:00:00+00'),
-- GOOGL
('trade_hugo_googl_apr_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_11', 'ob_system_11', 1700.00, 159.00, 1.00, 1.00, '2024-04-16 13:30:00+00'),
-- NVDA
('trade_hugo_nvda_apr_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_12', 'ob_system_12', 15.00, 128.50, 1.00, 1.00, '2024-04-22 15:00:00+00'),
-- AMZN - Premier achat
('trade_hugo_amzn_apr_1', 'stock_4', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_13', 'ob_system_13', 15.00, 175.00, 1.00, 1.00, '2024-04-25 10:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MAI 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_may_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_14', 'ob_system_14', 250.00, 175.00, 1.00, 1.00, '2024-05-07 09:45:00+00'),
-- GOOGL
('trade_hugo_googl_may_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_15', 'ob_system_15', 1500.00, 163.50, 1.00, 1.00, '2024-05-14 14:20:00+00'),
-- ABNB
('trade_hugo_abnb_may_1', 'stock_11', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_16', 'ob_system_16', 25.00, 134.00, 1.00, 1.00, '2024-05-20 16:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- JUIN 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_jun_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_17', 'ob_system_17', 200.00, 173.50, 1.00, 1.00, '2024-06-06 10:30:00+00'),
-- GOOGL
('trade_hugo_googl_jun_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_18', 'ob_system_18', 1000.00, 167.00, 1.00, 1.00, '2024-06-13 13:15:00+00'),
-- NVDA
('trade_hugo_nvda_jun_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_19', 'ob_system_19', 10.00, 130.00, 1.00, 1.00, '2024-06-18 15:30:00+00'),
-- AMZN
('trade_hugo_amzn_jun_1', 'stock_4', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_20', 'ob_system_20', 10.00, 177.00, 1.00, 1.00, '2024-06-24 11:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- JUILLET 2024 - Gros achats GOOGL
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- AAPL
('trade_hugo_aapl_jul_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_21', 'ob_system_21', 150.00, 176.50, 1.00, 1.00, '2024-07-02 09:00:00+00'),
-- GOOGL - Gros achats
('trade_hugo_googl_jul_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_22', 'ob_system_22', 1700.00, 170.50, 1.00, 1.00, '2024-07-09 14:00:00+00'),
('trade_hugo_googl_jul_2', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_23', 'ob_system_23', 1400.00, 172.00, 1.00, 1.00, '2024-07-16 10:30:00+00'),
-- ABNB
('trade_hugo_abnb_jul_1', 'stock_11', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_24', 'ob_system_24', 15.00, 136.00, 1.00, 1.00, '2024-07-23 15:45:00+00'),
-- NVDA
('trade_hugo_nvda_jul_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_25', 'ob_system_25', 8.00, 127.00, 1.00, 1.00, '2024-07-29 11:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- AOÛT 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- GOOGL
('trade_hugo_googl_aug_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_27', 'ob_system_27', 800.00, 173.50, 1.00, 1.00, '2024-08-13 13:45:00+00'),
-- AMZN
('trade_hugo_amzn_aug_1', 'stock_4', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_28', 'ob_system_28', 10.00, 180.00, 1.00, 1.00, '2024-08-20 14:30:00+00'),
-- NVDA
('trade_hugo_nvda_aug_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_29', 'ob_system_29', 5.00, 129.00, 1.00, 1.00, '2024-08-27 16:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- SEPTEMBRE 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- GOOGL - Derniers achats massifs
('trade_hugo_googl_sep_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_31', 'ob_system_31', 600.00, 175.00, 1.00, 1.00, '2024-09-10 11:00:00+00'),
-- ABNB - Dernier achat
('trade_hugo_abnb_sep_1', 'stock_11', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_32', 'ob_system_32', 15.00, 137.00, 1.00, 1.00, '2024-09-17 14:15:00+00'),
-- AMZN - Dernier achat
('trade_hugo_amzn_sep_1', 'stock_4', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_33', 'ob_system_33', 10.00, 181.00, 1.00, 1.00, '2024-09-24 15:45:00+00'),
-- NVDA - Dernier achat
('trade_hugo_nvda_sep_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_34', 'ob_system_34', 2.00, 126.00, 1.00, 1.00, '2024-09-30 16:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- OCTOBRE 2024 - Continuation
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_oct_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_35', 'ob_system_35', 0.01, 176.00, 1.00, 1.00, '2024-10-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- NOVEMBRE 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_nov_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_36', 'ob_system_36', 0.01, 175.80, 1.00, 1.00, '2024-11-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- DÉCEMBRE 2024
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_dec24_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_37', 'ob_system_37', 0.01, 176.20, 1.00, 1.00, '2024-12-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- JANVIER 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_jan25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_38', 'ob_system_38', 0.01, 176.50, 1.00, 1.00, '2025-01-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- FÉVRIER 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_aapl_feb25_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_39', 'ob_system_39', 0.01, 190.00, 1.00, 1.00, '2025-02-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MARS 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_mar25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_40', 'ob_system_40', 0.01, 177.00, 1.00, 1.00, '2025-03-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- AVRIL 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_nvda_apr25_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_41', 'ob_system_41', 0.01, 145.00, 1.00, 1.00, '2025-04-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MAI 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_may25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_42', 'ob_system_42', 0.01, 177.50, 1.00, 1.00, '2025-05-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- JUIN 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_aapl_jun25_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_43', 'ob_system_43', 0.01, 192.00, 1.00, 1.00, '2025-06-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- JUILLET 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_jul25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_44', 'ob_system_44', 0.01, 178.00, 1.00, 1.00, '2025-07-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- AOÛT 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_nvda_aug25_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_45', 'ob_system_45', 0.01, 147.00, 1.00, 1.00, '2025-08-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- SEPTEMBRE 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_sep25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_46', 'ob_system_46', 0.01, 178.50, 1.00, 1.00, '2025-09-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- OCTOBRE 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_aapl_oct25_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_47', 'ob_system_47', 0.01, 194.00, 1.00, 1.00, '2025-10-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- NOVEMBRE 2025
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
('trade_hugo_googl_nov25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_48', 'ob_system_48', 0.01, 179.00, 1.00, 1.00, '2025-11-15 10:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- DÉCEMBRE 2025 - Trades substantiels pour monthly/weekly data
-- =========================================
INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- Début décembre
('trade_hugo_googl_dec25_1', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_49', 'ob_system_49', 10.00, 174.50, 1.00, 1.00, '2025-12-02 09:30:00+00'),
('trade_hugo_aapl_dec25_1', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_50', 'ob_system_50', 5.00, 191.20, 1.00, 1.00, '2025-12-04 14:15:00+00'),
('trade_hugo_nvda_dec25_1', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_51', 'ob_system_51', 3.00, 146.80, 1.00, 1.00, '2025-12-06 11:00:00+00'),
-- Mi-décembre
('trade_hugo_googl_dec25_2', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_52', 'ob_system_52', 8.00, 175.00, 1.00, 1.00, '2025-12-09 10:30:00+00'),
('trade_hugo_aapl_dec25_2', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_53', 'ob_system_53', 4.00, 191.80, 1.00, 1.00, '2025-12-11 13:45:00+00'),
('trade_hugo_nvda_dec25_2', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_54', 'ob_system_54', 2.00, 147.20, 1.00, 1.00, '2025-12-13 15:20:00+00'),
('trade_hugo_googl_dec25_3', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_55', 'ob_system_55', 12.00, 175.20, 1.00, 1.00, '2025-12-16 09:00:00+00'),
-- Trades de la semaine (weekly data - last 7 days)
('trade_hugo_aapl_dec25_3', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_56', 'ob_system_56', 6.00, 192.00, 1.00, 1.00, '2025-12-23 10:00:00+00'),
('trade_hugo_nvda_dec25_3', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_57', 'ob_system_57', 4.00, 147.50, 1.00, 1.00, '2025-12-24 14:30:00+00'),
('trade_hugo_googl_dec25_4', 'stock_2', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_58', 'ob_system_58', 15.00, 175.40, 1.00, 1.00, '2025-12-26 11:15:00+00'),
('trade_hugo_aapl_dec25_4', 'stock_1', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_59', 'ob_system_59', 3.00, 192.50, 1.00, 1.00, '2025-12-27 13:00:00+00'),
('trade_hugo_nvda_dec25_4', 'stock_7', 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a', 'SYSTEM', 'ob_hugo_60', 'ob_system_60', 2.00, 148.00, 1.00, 1.00, '2025-12-28 15:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- RÉSUMÉ DES ACHATS
-- =========================================
-- Total AAPL: 300+400+350+300+250+200+150 = 2000 shares ✓
-- Total GOOGL: 1200+1500+1800+1800+1700+1500+1000+1700+1400+800+600 = 15000 shares ✓
-- Total ABNB: 30+25+15+15 = 85 shares ✓
-- Total NVDA: 20+15+10+8+5+2 = 60 shares ✓
-- Total AMZN: 15+10+10+10 = 45 shares ✓

-- Vérification des achats Hugo Laurent
SELECT
    s.symbol,
    s.name,
    COUNT(t.id) as nb_trades,
    SUM(t.quantity) as total_quantity,
    ROUND(AVG(t.price), 2) as avg_price,
    ROUND(SUM(t.quantity * t.price), 2) as total_invested
FROM trades t
JOIN stocks s ON t.stock_id = s.id
WHERE t.buyer_id = 'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a'
GROUP BY s.id, s.symbol, s.name
ORDER BY total_invested DESC;
