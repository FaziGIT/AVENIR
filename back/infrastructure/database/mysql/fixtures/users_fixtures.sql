-- Fixtures pour les utilisateurs (MySQL)
-- Ce fichier contient les données de test pour le système d'utilisateurs

-- Définir l'encodage UTF-8
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

-- Nettoyer les données existantes (attention : cela supprimera aussi les chats et messages associés)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- DIRECTEUR (1)
-- =========================================

INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES (
    'dir-001',
    'Pierre',
    'Durand',
    'pierre.durand@avenir-bank.fr',
    'DIR001',
    '$2b$10$YourHashedPasswordHere', -- À remplacer par un vrai hash bcrypt
    'DIRECTOR',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 2 YEAR),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- =========================================
-- CONSEILLERS (3)
-- =========================================

INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES
(
    'adv-001',
    'Marie',
    'Martin',
    'marie.martin@avenir-bank.fr',
    'ADV001',
    '$2b$10$YourHashedPasswordHere',
    'ADVISOR',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 1 YEAR),
    NOW()
),
(
    'adv-002',
    'Thomas',
    'Bernard',
    'thomas.bernard@avenir-bank.fr',
    'ADV002',
    '$2b$10$YourHashedPasswordHere',
    'ADVISOR',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 1 YEAR),
    NOW()
),
(
    'adv-003',
    'Sophie',
    'Dubois',
    'sophie.dubois@avenir-bank.fr',
    'ADV003',
    '$2b$10$YourHashedPasswordHere',
    'ADVISOR',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- =========================================
-- CLIENTS (5 + John Doe)
-- =========================================

-- John Doe (utilisateur existant à préserver)
INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES (
    'client-john-doe',
    'John',
    'Doe',
    'john.doe@example.com',
    'JD001',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Autres clients
INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at, updated_at)
VALUES
(
    'client-001',
    'Jean',
    'Dupont',
    'jean.dupont@gmail.com',
    'CLI001',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 3 MONTH),
    NOW()
),
(
    'client-002',
    'Emma',
    'Leroy',
    'emma.leroy@gmail.com',
    'CLI002',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 2 MONTH),
    NOW()
),
(
    'client-003',
    'Lucas',
    'Moreau',
    'lucas.moreau@gmail.com',
    'CLI003',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 1 MONTH),
    NOW()
),
(
    'client-004',
    'Léa',
    'Simon',
    'lea.simon@gmail.com',
    'CLI004',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 2 WEEK),
    NOW()
),
(
    'client-005',
    'Hugo',
    'Laurent',
    'hugo.laurent@gmail.com',
    'CLI005',
    '$2b$10$YourHashedPasswordHere',
    'CLIENT',
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 1 WEEK),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- =========================================
-- COMPTES BANCAIRES pour quelques clients
-- =========================================

-- Compte pour John Doe
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at, updated_at)
VALUES
(
    'acc-john-doe-1',
    'client-john-doe',
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
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
),
(
    'acc-john-doe-2',
    'client-john-doe',
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
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Comptes pour Jean Dupont
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at, updated_at)
VALUES
(
    'acc-client-001-1',
    'client-001',
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
    DATE_SUB(NOW(), INTERVAL 3 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Comptes pour Emma Leroy
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at, updated_at)
VALUES
(
    'acc-client-002-1',
    'client-002',
    'FR7612345678901234567890131',
    'Compte Courant - Emma Leroy',
    'CURRENT',
    3200.00,
    'EUR',
    '4666666666666666',
    'EMMA LEROY',
    '06/30',
    '789',
    NULL,
    DATE_SUB(NOW(), INTERVAL 2 MONTH),
    NOW()
),
(
    'acc-client-002-2',
    'client-002',
    'FR7612345678901234567890132',
    'Livret Épargne - Emma Leroy',
    'SAVINGS',
    15000.00,
    'EUR',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    DATE_SUB(NOW(), INTERVAL 2 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Compte pour Hugo Laurent
INSERT INTO accounts (id, user_id, iban, name, type, balance, currency, card_number, card_holder_name, card_expiry_date, card_cvv, saving_rate_id, created_at, updated_at)
VALUES
(
    'acc-client-005-1',
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
    DATE_SUB(NOW(), INTERVAL 1 WEEK),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

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

