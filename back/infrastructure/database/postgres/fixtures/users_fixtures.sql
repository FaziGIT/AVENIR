-- Fixtures pour les utilisateurs (PostgreSQL)
-- Ce fichier contient les données de test pour le système d'utilisateurs

-- Définir l'encodage UTF-8
SET client_encoding = 'UTF8';

-- Nettoyer les données existantes (attention : cela supprimera aussi les chats et messages associés)
-- TRUNCATE users CASCADE;

-- =========================================
-- UTILISATEUR SYSTÈME (pour la liquidité du marché)
-- =========================================

INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES (
    'SYSTEM',
    'System',
    'Market Maker',
    'system@avenir-bank.fr',
    'SYS001',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'DIRECTOR',
    'ACTIVE',
    NOW() - INTERVAL '10 years',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- DIRECTEUR (1)
-- =========================================

INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES (
    'f3b7c8d6-0a4c-9f7b-3e1d-6c9a2b4d7f0e',
    'Pierre',
    'Durand',
    'pierre.durand@avenir-bank.fr',
    'DIR001',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'DIRECTOR',
    'ACTIVE',
    NOW() - INTERVAL '2 years',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CONSEILLERS (3)
-- =========================================

INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES
(
    'd1f5a6b4-8e2a-7d5f-1c9b-4a7e0f2b5d8c',
    'Marie',
    'Martin',
    'marie.martin@avenir-bank.fr',
    'ADV001',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'ADVISOR',
    'ACTIVE',
    NOW() - INTERVAL '1 year',
    NOW()
),
(
    'e2a6b7c5-9f3b-8e6a-2d0c-5b8f1a3c6e9d',
    'Thomas',
    'Bernard',
    'thomas.bernard@avenir-bank.fr',
    'ADV002',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'ADVISOR',
    'ACTIVE',
    NOW() - INTERVAL '1 year',
    NOW()
),
(
    'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    'Sophie',
    'Dubois',
    'sophie.dubois@avenir-bank.fr',
    'ADV003',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'ADVISOR',
    'ACTIVE',
    NOW() - INTERVAL '6 months',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CLIENTS (5 + John Doe)
-- =========================================

-- John Doe (utilisateur existant à préserver)
INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES (
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'John',
    'Doe',
    'john.doe@example.com',
    'JD001',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '6 months',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Autres clients
INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES
(
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'Jean',
    'Dupont',
    'jean.dupont@gmail.com',
    'CLI001',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '3 months',
    NOW()
),
(
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'Emma',
    'Leroy',
    'emma.leroy@gmail.com',
    'CLI002',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '2 months',
    NOW()
),
(
    'b9d3e4f2-6c0e-5b3d-9a7f-2e5c8d0f3b6a',
    'Lucas',
    'Moreau',
    'lucas.moreau@gmail.com',
    'CLI003',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '1 month',
    NOW()
),
(
    'c0e4f5a3-7d1f-6c4e-0b8a-3f6d9e1a4c7b',
    'Léa',
    'Simon',
    'lea.simon@gmail.com',
    'CLI004',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '2 weeks',
    NOW()
),
(
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'Hugo',
    'Laurent',
    'hugo.laurent@gmail.com',
    'CLI005',
    '$2b$10$v/NDOH5aws1CRVD6gbhgWeiBorIsLagnXSk5kP9ZnRmRYtRMysVc6',
    'CLIENT',
    'ACTIVE',
    NOW() - INTERVAL '1 week',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- COMPTES BANCAIRES pour quelques clients
-- =========================================

-- Compte pour John Doe
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at)
VALUES
(
    'e3f6a7b5-9c2d-8e3f-0a4b-1d5c9e6a2b7c',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'FR7612345678901234567890128',
    'Compte Courant - John Doe',
    'CURRENT',
    2500.00,
    'EUR',
    '4444444444444444',
    'JOHN DOE',
    '12/29',
    '321',
    NULL,
    NOW() - INTERVAL '6 months'
),
(
    'f4a7b8c6-0d3e-9f4a-1b5c-2e6d0a7b3c8d',
    'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
    'FR7612345678901234567890129',
    'Livret Épargne - John Doe',
    'SAVINGS',
    10000.00,
    'EUR',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '6 months'
) ON CONFLICT (id) DO NOTHING;

-- Comptes pour Jean Dupont
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at)
VALUES
(
    'a5b8c9d7-1e4f-0a5b-2c6d-3f7e1a8b4c9e',
    'f7f35a80-0a07-4f07-a429-70be5f5c4d86',
    'FR7612345678901234567890130',
    'Compte Courant - Jean Dupont',
    'CURRENT',
    1500.00,
    'EUR',
    '4555555555555555',
    'JEAN DUPONT',
    '03/30',
    '654',
    NULL,
    NOW() - INTERVAL '3 months'
) ON CONFLICT (id) DO NOTHING;

-- Comptes pour Emma Leroy
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at)
VALUES
(
    'b6c9d0e8-2f5a-1b6c-3d7e-4a8f2b9c5d0f',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'FR7612345678901234567890131',
    'Compte Courant - Emma Leroy',
    'CURRENT',
    3200.00,
    'EUR',
    '4666666666666666',
    'EMMA LEROY',
    '07/29',
    '987',
    NULL,
    NOW() - INTERVAL '2 months'
),
(
    'c7d0e1f9-3a6b-2c7d-4e8f-5b9a3c0d6e1a',
    'a8c2f3e1-5b9d-4a2c-8f6e-1d4b7c9e2a5f',
    'FR7612345678901234567890132',
    'Livret A - Emma Leroy',
    'SAVINGS',
    15000.00,
    'EUR',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 months'
) ON CONFLICT (id) DO NOTHING;

-- Compte pour Hugo Laurent
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at)
VALUES
(
    'd8e1f2a0-4b7c-3d8e-5f9a-6c0d4e7b1f3a',
    'd2e5f6a4-8b1c-7d2e-9f3a-0c4b8d5e1f2a',
    'FR7612345678901234567890133',
    'Compte Courant - Hugo Laurent',
    'CURRENT',
    1140000.00,
    'EUR',
    '4777777777777777',
    'HUGO LAURENT',
    '09/30',
    '456',
    NULL,
    NOW() - INTERVAL '1 week'
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- Résumé des données insérées
-- =========================================

SELECT
    'Utilisateurs créés' as type,
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY
    CASE role
        WHEN 'DIRECTOR' THEN 1
        WHEN 'ADVISOR' THEN 2
        WHEN 'CLIENT' THEN 3
    END;

SELECT
    'Comptes bancaires créés' as type,
    type as account_type,
    COUNT(*) as count,
    SUM(balance) as total_balance
FROM accounts
GROUP BY type;

