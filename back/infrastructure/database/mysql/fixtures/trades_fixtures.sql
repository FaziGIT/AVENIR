SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================================
-- TRADES - AAPL
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
(
    'trade_aapl_1',
    'stock_1',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',  -- Sophie Dubois (buyer)
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',  -- Hugo Laurent (seller)
    'ob_bid_aapl_1',
    'ob_ask_aapl_1',
    5.00,
    192.00,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
),
(
    'trade_aapl_2',
    'stock_1',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',  -- Lucas Petit (buyer)
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',  -- Léa Simon (seller)
    'ob_bid_aapl_2',
    'ob_ask_aapl_2',
    3.50,
    191.80,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 90 MINUTE)
),
(
    'trade_aapl_3',
    'stock_1',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',  -- Emma Moreau (buyer) - partial fill
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',  -- Hugo Laurent (seller)
    'ob_bid_aapl_3',
    'ob_ask_aapl_1',
    5.00,
    191.50,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 1 HOUR)
);

-- =========================================
-- TRADES - GOOGL (Historical data for charts)
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
-- January 2024
('trade_googl_001', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 140.50, 1.00, 1.00, '2024-01-05 14:30:00'),
('trade_googl_002', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 8.00, 139.80, 1.00, 1.00, '2024-01-10 10:15:00'),
('trade_googl_003', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 138.50, 1.00, 1.00, '2024-01-15 16:00:00'),
('trade_googl_004', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 10.00, 139.20, 1.00, 1.00, '2024-01-22 11:20:00'),
('trade_googl_005', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 20.00, 141.50, 1.00, 1.00, '2024-01-29 15:45:00'),

-- February 2024
('trade_googl_006', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 144.20, 1.00, 1.00, '2024-02-05 09:30:00'),
('trade_googl_007', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 18.00, 146.80, 1.00, 1.00, '2024-02-12 13:15:00'),
('trade_googl_008', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 148.50, 1.00, 1.00, '2024-02-19 10:40:00'),
('trade_googl_009', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 150.20, 1.00, 1.00, '2024-02-26 14:25:00'),

-- March 2024
('trade_googl_010', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 151.80, 1.00, 1.00, '2024-03-04 11:00:00'),
('trade_googl_011', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 17.00, 153.40, 1.00, 1.00, '2024-03-11 15:20:00'),
('trade_googl_012', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 9.00, 154.20, 1.00, 1.00, '2024-03-18 09:55:00'),
('trade_googl_013', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 21.00, 155.90, 1.00, 1.00, '2024-03-25 13:30:00'),

-- April 2024
('trade_googl_014', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 157.30, 1.00, 1.00, '2024-04-01 10:10:00'),
('trade_googl_015', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 158.70, 1.00, 1.00, '2024-04-08 14:45:00'),
('trade_googl_016', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 159.50, 1.00, 1.00, '2024-04-15 11:30:00'),
('trade_googl_017', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 19.00, 160.80, 1.00, 1.00, '2024-04-22 16:15:00'),
('trade_googl_018', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 161.40, 1.00, 1.00, '2024-04-29 12:50:00'),

-- May 2024
('trade_googl_019', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 162.50, 1.00, 1.00, '2024-05-06 09:20:00'),
('trade_googl_020', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 163.20, 1.00, 1.00, '2024-05-13 14:35:00'),
('trade_googl_021', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 18.00, 164.80, 1.00, 1.00, '2024-05-20 10:55:00'),
('trade_googl_022', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 10.00, 165.50, 1.00, 1.00, '2024-05-27 15:40:00'),

-- June 2024
('trade_googl_023', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 17.00, 166.30, 1.00, 1.00, '2024-06-03 11:15:00'),
('trade_googl_024', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 167.60, 1.00, 1.00, '2024-06-10 13:25:00'),
('trade_googl_025', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 168.20, 1.00, 1.00, '2024-06-17 09:50:00'),
('trade_googl_026', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 169.40, 1.00, 1.00, '2024-06-24 14:30:00'),

-- July 2024
('trade_googl_027', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 170.10, 1.00, 1.00, '2024-07-01 10:40:00'),
('trade_googl_028', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 19.00, 170.90, 1.00, 1.00, '2024-07-08 15:05:00'),
('trade_googl_029', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 171.50, 1.00, 1.00, '2024-07-15 11:20:00'),
('trade_googl_030', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 172.30, 1.00, 1.00, '2024-07-22 13:45:00'),
('trade_googl_031', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 20.00, 172.80, 1.00, 1.00, '2024-07-29 16:10:00'),

-- August 2024
('trade_googl_032', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 173.20, 1.00, 1.00, '2024-08-05 10:25:00'),
('trade_googl_033', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 173.60, 1.00, 1.00, '2024-08-12 14:50:00'),
('trade_googl_034', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 174.10, 1.00, 1.00, '2024-08-19 11:35:00'),
('trade_googl_035', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 18.00, 174.50, 1.00, 1.00, '2024-08-26 15:15:00'),

-- September 2024
('trade_googl_036', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 174.80, 1.00, 1.00, '2024-09-02 09:40:00'),
('trade_googl_037', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 175.20, 1.00, 1.00, '2024-09-09 13:55:00'),
('trade_googl_038', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 17.00, 175.60, 1.00, 1.00, '2024-09-16 10:20:00'),
('trade_googl_039', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 176.00, 1.00, 1.00, '2024-09-23 14:45:00'),
('trade_googl_040', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 176.30, 1.00, 1.00, '2024-09-30 16:00:00'),

-- October 2024
('trade_googl_041', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 176.50, 1.00, 1.00, '2024-10-07 11:10:00'),
('trade_googl_042', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 176.20, 1.00, 1.00, '2024-10-14 15:30:00'),
('trade_googl_043', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 19.00, 175.90, 1.00, 1.00, '2024-10-21 12:50:00'),
('trade_googl_044', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 176.40, 1.00, 1.00, '2024-10-28 09:15:00'),

-- November 2024
('trade_googl_045', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 176.10, 1.00, 1.00, '2024-11-04 13:40:00'),
('trade_googl_046', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 175.80, 1.00, 1.00, '2024-11-11 10:05:00'),
('trade_googl_047', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 17.00, 176.30, 1.00, 1.00, '2024-11-18 14:20:00'),
('trade_googl_048', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 176.00, 1.00, 1.00, '2024-11-25 11:55:00'),

-- December 2024 - Recent weeks
('trade_googl_049', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 175.60, 1.00, 1.00, '2024-12-02 09:30:00'),
('trade_googl_050', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 176.10, 1.00, 1.00, '2024-12-09 13:15:00'),
('trade_googl_051', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 176.40, 1.00, 1.00, '2024-12-16 10:50:00'),
('trade_googl_052', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 18.00, 175.30, 1.00, 1.00, '2024-12-23 15:25:00'),

-- December 2025 - Last 7 days (for weekly chart)
('trade_googl_053', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 14.00, 175.10, 1.00, 1.00, '2025-12-22 09:15:00'),
('trade_googl_054', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 11.00, 175.40, 1.00, 1.00, '2025-12-23 11:30:00'),
('trade_googl_055', 'stock_2', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 15.00, 175.20, 1.00, 1.00, '2025-12-24 14:45:00'),
('trade_googl_056', 'stock_2', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 13.00, 175.50, 1.00, 1.00, '2025-12-26 10:20:00'),
('trade_googl_057', 'stock_2', 'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c', 'f7f35a80-0a07-4f07-a429-70be5f5c4d86', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 16.00, 175.30, 1.00, 1.00, '2025-12-27 13:10:00'),
('trade_googl_058', 'stock_2', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'ob_system_ask_googl_1', 'ob_system_ask_googl_2', 12.00, 175.25, 1.00, 1.00, '2025-12-28 15:40:00');

-- =========================================
-- TRADES - NVDA
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
(
    'trade_nvda_1',
    'stock_7',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',  -- Emma Moreau (buyer)
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',  -- Pierre Durand (seller)
    'ob_bid_nvda_1',
    'ob_ask_nvda_1',
    12.00,
    147.00,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 40 MINUTE)
);

-- =========================================
-- TRADES - META
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
(
    'trade_meta_1',
    'stock_5',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'ob_bid_meta_1',
    'ob_ask_meta_1',
    2.50,
    512.50,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
);

-- =========================================
-- TRADES - TSLA
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
(
    'trade_tsla_1',
    'stock_6',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',  -- Lucas Petit (buyer)
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',  -- Thomas Bernard (seller)
    'ob_bid_tsla_1',
    'ob_ask_tsla_1',
    10.00,
    244.75,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 20 MINUTE)
);

-- =========================================
-- TRADES - AMD
-- =========================================

INSERT IGNORE INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
VALUES
(
    'trade_amd_1',
    'stock_9',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',
    'ob_bid_amd_1',
    'ob_ask_amd_1',
    8.00,
    162.50,
    1.00,
    1.00,
    DATE_SUB(NOW(), INTERVAL 15 MINUTE)
);

-- Vérification de l'historique des trades
SELECT
    s.symbol,
    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:00:00') as trade_hour,
    COUNT(*) as total_trades,
    SUM(t.quantity) as total_volume,
    AVG(t.price) as avg_price,
    MIN(t.price) as min_price,
    MAX(t.price) as max_price
FROM trades t
JOIN stocks s ON t.stock_id = s.id
GROUP BY s.symbol, DATE_FORMAT(t.created_at, '%Y-%m-%d %H:00:00')
ORDER BY trade_hour DESC, s.symbol;
