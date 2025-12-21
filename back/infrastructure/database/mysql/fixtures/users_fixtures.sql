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
INSERT INTO accounts (id, user_id, type, balance, currency, created_at, updated_at)
VALUES
(
    'acc-john-doe-1',
    'client-john-doe',
    'CHECKING',
    2500.00,
    'EUR',
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
),
(
    'acc-john-doe-2',
    'client-john-doe',
    'SAVINGS',
    10000.00,
    'EUR',
    DATE_SUB(NOW(), INTERVAL 6 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Comptes pour Jean Dupont
INSERT INTO accounts (id, user_id, type, balance, currency, created_at, updated_at)
VALUES
(
    'acc-client-001-1',
    'client-001',
    'CHECKING',
    1500.00,
    'EUR',
    DATE_SUB(NOW(), INTERVAL 3 MONTH),
    NOW()
) ON DUPLICATE KEY UPDATE id = id;

-- Comptes pour Emma Leroy
INSERT INTO accounts (id, user_id, type, balance, currency, created_at, updated_at)
VALUES
(
    'acc-client-002-1',
    'client-002',
    'CHECKING',
    3200.00,
    'EUR',
    DATE_SUB(NOW(), INTERVAL 2 MONTH),
    NOW()
),
(
    'acc-client-002-2',
    'client-002',
    'SAVINGS',
    15000.00,
    'EUR',
    DATE_SUB(NOW(), INTERVAL 2 MONTH),
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

