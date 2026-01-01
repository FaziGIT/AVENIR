SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =========================================
-- ACTIONS DU DIRECTEUR (Pierre Durand)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_dir_1',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'LOGIN',
    'Connexion réussie depuis le bureau',
    '{"ip": "192.168.1.100", "device": "Chrome/MacOS", "location": "Paris, France"}',
    DATE_SUB(NOW(), INTERVAL 4 HOUR)
),
(
    'ua_dir_2',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'ORDER_CREATED',
    'Création ordre de vente NVDA',
    '{"stock": "NVDA", "quantity": 18, "type": "LIMIT", "price": 147.50, "side": "ASK"}',
    DATE_SUB(NOW(), INTERVAL 3 HOUR)
),
(
    'ua_dir_3',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'PORTFOLIO_VIEW',
    'Consultation du dashboard',
    '{"page": "investment"}',
    DATE_SUB(NOW(), INTERVAL 150 MINUTE)
);

-- =========================================
-- ACTIONS CONSEILLER 1 (Marie Martin)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_adv1_1',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.105", "device": "Firefox/Windows", "location": "Lyon, France"}',
    DATE_SUB(NOW(), INTERVAL 3 HOUR)
),
(
    'ua_adv1_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'ORDER_CREATED',
    'Création ordre de vente GOOGL',
    '{"stock": "GOOGL", "quantity": 10, "type": "LIMIT", "price": 175.50, "side": "ASK"}',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
),
(
    'ua_adv1_3',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'CHAT_OPENED',
    'Ouverture chat avec client',
    '{"chat_id": "chat_123", "client_name": "Sophie Dubois"}',
    DATE_SUB(NOW(), INTERVAL 90 MINUTE)
);

-- =========================================
-- ACTIONS CLIENT 1 (Sophie Dubois)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli1_1',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.200", "device": "Safari/iOS", "location": "Paris, France"}',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
),
(
    'ua_cli1_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'ORDER_CREATED',
    'Création ordre d\'achat AAPL',
    '{"stock": "AAPL", "quantity": 10, "type": "LIMIT", "price": 191.50, "side": "BID"}',
    DATE_SUB(NOW(), INTERVAL 90 MINUTE)
),
(
    'ua_cli1_3',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'PORTFOLIO_VIEW',
    'Consultation du portefeuille',
    '{"total_value": 17725, "profit_loss": 450}',
    DATE_SUB(NOW(), INTERVAL 45 MINUTE)
),
(
    'ua_cli1_4',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'STOCK_DETAIL_VIEW',
    'Consultation détail action NVDA',
    '{"stock": "NVDA", "current_price": 147.00}',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
);

-- =========================================
-- ACTIONS CLIENT 2 (Lucas Petit)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli2_1',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.201", "device": "Chrome/Android", "location": "Marseille, France"}',
    DATE_SUB(NOW(), INTERVAL 90 MINUTE)
),
(
    'ua_cli2_2',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'ORDER_CREATED',
    'Création ordre d\'achat TSLA',
    '{"stock": "TSLA", "quantity": 15, "type": "LIMIT", "price": 244.00, "side": "BID"}',
    DATE_SUB(NOW(), INTERVAL 70 MINUTE)
),
(
    'ua_cli2_3',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'TRADE_EXECUTED',
    'Trade exécuté - Achat AAPL',
    '{"trade_id": "trade_aapl_2", "quantity": 3.50, "price": 191.80}',
    DATE_SUB(NOW(), INTERVAL 50 MINUTE)
);

-- =========================================
-- ACTIONS CLIENT 3 (Emma Moreau)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli3_1',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.202", "device": "Edge/Windows", "location": "Toulouse, France"}',
    DATE_SUB(NOW(), INTERVAL 75 MINUTE)
),
(
    'ua_cli3_2',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'ORDER_CREATED',
    'Création ordre d\'achat AAPL',
    '{"stock": "AAPL", "quantity": 20, "type": "LIMIT", "price": 190.50, "side": "BID"}',
    DATE_SUB(NOW(), INTERVAL 65 MINUTE)
),
(
    'ua_cli3_3',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'TRADE_EXECUTED',
    'Trade partiellement exécuté - Achat AAPL',
    '{"trade_id": "trade_aapl_3", "quantity": 5, "filled_quantity": 5, "remaining": 15}',
    DATE_SUB(NOW(), INTERVAL 55 MINUTE)
);

-- =========================================
-- ACTIONS CLIENT 4 (Hugo Laurent)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli4_1',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.203", "device": "Safari/MacOS", "location": "Bordeaux, France"}',
    DATE_SUB(NOW(), INTERVAL 40 MINUTE)
),
(
    'ua_cli4_2',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'ORDER_CREATED',
    'Création ordre MARKET achat MSFT',
    '{"stock": "MSFT", "quantity": 5, "type": "MARKET", "side": "BID"}',
    DATE_SUB(NOW(), INTERVAL 25 MINUTE)
);

-- =========================================
-- ACTIONS CLIENT 5 (Léa Simon)
-- =========================================

INSERT IGNORE INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli5_1',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.204", "device": "Chrome/Linux", "location": "Lille, France"}',
    DATE_SUB(NOW(), INTERVAL 35 MINUTE)
),
(
    'ua_cli5_2',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'ORDER_CREATED',
    'Création ordre STOP loss AAPL',
    '{"stock": "AAPL", "quantity": 5, "type": "STOP", "stop_price": 185.00, "side": "ASK"}',
    DATE_SUB(NOW(), INTERVAL 20 MINUTE)
),
(
    'ua_cli5_3',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'LOGOUT',
    'Déconnexion',
    '{"session_duration": "15m"}',
    DATE_SUB(NOW(), INTERVAL 5 MINUTE)
);

-- Vérification des actions par type
SELECT
    action_type,
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as unique_users
FROM user_actions
GROUP BY action_type
ORDER BY total_actions DESC;
