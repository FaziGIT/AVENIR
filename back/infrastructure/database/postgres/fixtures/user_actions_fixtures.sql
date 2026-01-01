SET client_encoding = 'UTF8';

-- =========================================
-- ACTIONS DU DIRECTEUR (Pierre Durand)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_dir_1',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'LOGIN',
    'Connexion réussie depuis le bureau',
    '{"ip": "192.168.1.100", "device": "Chrome/MacOS", "location": "Paris, France"}',
    NOW() - INTERVAL '4 hours'
),
(
    'ua_dir_2',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'ORDER_CREATED',
    'Création ordre de vente NVDA',
    '{"stock": "NVDA", "quantity": 18, "type": "LIMIT", "price": 147.50, "side": "ASK"}',
    NOW() - INTERVAL '3 hours'
),
(
    'ua_dir_3',
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'PORTFOLIO_VIEW',
    'Consultation du dashboard',
    '{"page": "investment"}',
    NOW() - INTERVAL '2 hours 30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CONSEILLER 1 (Marie Martin)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_adv1_1',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.105", "device": "Firefox/Windows", "location": "Lyon, France"}',
    NOW() - INTERVAL '3 hours'
),
(
    'ua_adv1_2',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'ORDER_CREATED',
    'Création ordre de vente GOOGL',
    '{"stock": "GOOGL", "quantity": 10, "type": "LIMIT", "price": 175.50, "side": "ASK"}',
    NOW() - INTERVAL '2 hours'
),
(
    'ua_adv1_3',
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'CHAT_OPENED',
    'Ouverture chat avec client',
    '{"chat_id": "chat_123", "client_name": "Sophie Dubois"}',
    NOW() - INTERVAL '1 hour 30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CLIENT 1 (Sophie Dubois)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli1_1',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.200", "device": "Safari/iOS", "location": "Paris, France"}',
    NOW() - INTERVAL '2 hours'
),
(
    'ua_cli1_2',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'ORDER_CREATED',
    'Création ordre d''achat AAPL',
    '{"stock": "AAPL", "quantity": 10, "type": "LIMIT", "price": 191.50, "side": "BID"}',
    NOW() - INTERVAL '1 hour 30 minutes'
),
(
    'ua_cli1_3',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'PORTFOLIO_VIEW',
    'Consultation du portefeuille',
    '{"total_value": 17725, "profit_loss": 450}',
    NOW() - INTERVAL '45 minutes'
),
(
    'ua_cli1_4',
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'STOCK_DETAIL_VIEW',
    'Consultation détail action NVDA',
    '{"stock": "NVDA", "current_price": 147.00}',
    NOW() - INTERVAL '30 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CLIENT 2 (Lucas Petit)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli2_1',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.201", "device": "Chrome/Android", "location": "Marseille, France"}',
    NOW() - INTERVAL '90 minutes'
),
(
    'ua_cli2_2',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'ORDER_CREATED',
    'Création ordre d''achat TSLA',
    '{"stock": "TSLA", "quantity": 15, "type": "LIMIT", "price": 244.00, "side": "BID"}',
    NOW() - INTERVAL '70 minutes'
),
(
    'ua_cli2_3',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'TRADE_EXECUTED',
    'Trade exécuté - Achat AAPL',
    '{"trade_id": "trade_aapl_2", "quantity": 3.50, "price": 191.80}',
    NOW() - INTERVAL '50 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CLIENT 3 (Emma Moreau)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli3_1',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.202", "device": "Edge/Windows", "location": "Toulouse, France"}',
    NOW() - INTERVAL '75 minutes'
),
(
    'ua_cli3_2',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'ORDER_CREATED',
    'Création ordre d''achat AAPL',
    '{"stock": "AAPL", "quantity": 20, "type": "LIMIT", "price": 190.50, "side": "BID"}',
    NOW() - INTERVAL '65 minutes'
),
(
    'ua_cli3_3',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'TRADE_EXECUTED',
    'Trade partiellement exécuté - Achat AAPL',
    '{"trade_id": "trade_aapl_3", "quantity": 5, "filled_quantity": 5, "remaining": 15}',
    NOW() - INTERVAL '55 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CLIENT 4 (Hugo Laurent)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli4_1',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.203", "device": "Safari/MacOS", "location": "Bordeaux, France"}',
    NOW() - INTERVAL '40 minutes'
),
(
    'ua_cli4_2',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'ORDER_CREATED',
    'Création ordre MARKET achat MSFT',
    '{"stock": "MSFT", "quantity": 5, "type": "MARKET", "side": "BID"}',
    NOW() - INTERVAL '25 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- ACTIONS CLIENT 5 (Léa Simon)
-- =========================================

INSERT INTO user_actions (id, user_id, action_type, description, metadata, created_at)
VALUES
(
    'ua_cli5_1',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'LOGIN',
    'Connexion réussie',
    '{"ip": "192.168.1.204", "device": "Chrome/Linux", "location": "Lille, France"}',
    NOW() - INTERVAL '35 minutes'
),
(
    'ua_cli5_2',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'ORDER_CREATED',
    'Création ordre STOP loss AAPL',
    '{"stock": "AAPL", "quantity": 5, "type": "STOP", "stop_price": 185.00, "side": "ASK"}',
    NOW() - INTERVAL '20 minutes'
),
(
    'ua_cli5_3',
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'LOGOUT',
    'Déconnexion',
    '{"session_duration": "15m"}',
    NOW() - INTERVAL '5 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- Vérification des actions par type
SELECT
    action_type,
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as unique_users
FROM user_actions
GROUP BY action_type
ORDER BY total_actions DESC;
