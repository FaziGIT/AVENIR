-- Fixtures pour le système de chat (MySQL)
-- Ce fichier contient des données de test pour le système de chat

-- Définir l'encodage UTF-8
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

-- Nettoyer les données existantes
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE messages;
TRUNCATE TABLE chats;
SET FOREIGN_KEY_CHECKS = 1;

-- Créer 3 chats de test
-- Chat 1: En attente (PENDING) - Nouveau client qui demande des informations
INSERT INTO chats (id, client_id, advisor_id, status, created_at, updated_at)
SELECT
    'chat-pending-1',
    u.id,
    NULL,
    'PENDING',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

-- Messages pour le chat pending
INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-pending-1-1',
    'chat-pending-1',
    u.id,
    'Bonjour, j\'aimerais obtenir des informations sur vos offres de crédit immobilier. Quels sont les taux actuels ?',
    FALSE,
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

-- Chat 2: Actif (ACTIVE) - Conversation entre un client et un conseiller
INSERT INTO chats (id, client_id, advisor_id, status, created_at, updated_at)
SELECT
    'chat-active-1',
    c.id,
    a.id,
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
FROM
    (SELECT id FROM users WHERE role = 'CLIENT' LIMIT 1) c,
    (SELECT id FROM users WHERE role = 'ADVISOR' LIMIT 1) a;

-- Messages pour le chat actif
INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-1-1',
    'chat-active-1',
    u.id,
    'Bonjour, je souhaiterais ouvrir un compte épargne. Quelles sont les options disponibles ?',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 1 DAY)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-1-2',
    'chat-active-1',
    u.id,
    'Bonjour ! Je serais ravi de vous aider. Nous proposons plusieurs types de comptes épargne : Livret A, Livret Jeune, et PEL. Chacun a ses avantages spécifiques.',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 23 HOUR)
FROM users u
WHERE u.role = 'ADVISOR'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-1-3',
    'chat-active-1',
    u.id,
    'Quels sont les taux d\'intérêt pour le Livret A et le PEL ?',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 22 HOUR)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-1-4',
    'chat-active-1',
    u.id,
    'Le Livret A offre actuellement un taux de 3%, plafonné à 22 950€. Le PEL a un taux de 2% avec une durée minimale de 4 ans. Lequel vous intéresse le plus ?',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 21 HOUR)
FROM users u
WHERE u.role = 'ADVISOR'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-1-5',
    'chat-active-1',
    u.id,
    'Le Livret A me semble plus adapté pour commencer. Comment puis-je l\'ouvrir ?',
    FALSE,
    DATE_SUB(NOW(), INTERVAL 30 MINUTE)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

-- Chat 3: Un autre chat actif avec un directeur qui participe
INSERT INTO chats (id, client_id, advisor_id, status, created_at, updated_at)
SELECT
    'chat-active-2',
    c.id,
    a.id,
    'ACTIVE',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 1 HOUR)
FROM
    (SELECT id FROM users WHERE role = 'CLIENT' LIMIT 1 OFFSET 1) c,
    (SELECT id FROM users WHERE role = 'ADVISOR' LIMIT 1 OFFSET 1) a;

-- Messages pour le deuxième chat actif
INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-2-1',
    'chat-active-2',
    u.id,
    'Bonjour, j\'ai besoin d\'un prêt automobile de 25 000€. Quelles sont vos conditions ?',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 3 DAY)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1 OFFSET 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-2-2',
    'chat-active-2',
    u.id,
    'Bonjour ! Pour un prêt de 25 000€, nous pouvons vous proposer des durées de 36 à 84 mois avec des taux à partir de 3,5%. Quelle durée envisagez-vous ?',
    TRUE,
    DATE_SUB(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 23 HOUR)
FROM users u
WHERE u.role = 'ADVISOR'
LIMIT 1 OFFSET 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-2-3',
    'chat-active-2',
    u.id,
    'Je pense à 60 mois. Quel serait le montant des mensualités ?',
    TRUE,
    DATE_SUB(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 22 HOUR)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1 OFFSET 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-2-4',
    'chat-active-2',
    u.id,
    'Bonjour, je suis le directeur et je vais superviser cette demande. Pour un prêt de 25 000€ sur 60 mois à 3,5%, les mensualités seraient d\'environ 455€. Nous pouvons vous proposer une offre personnalisée.',
    TRUE,
    DATE_SUB(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 20 HOUR)
FROM users u
WHERE u.role = 'DIRECTOR'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-active-2-5',
    'chat-active-2',
    u.id,
    'C\'est parfait ! Comment puis-je procéder pour faire ma demande officielle ?',
    FALSE,
    DATE_SUB(NOW(), INTERVAL 1 HOUR)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1 OFFSET 1;

-- Chat 4: Chat fermé (CLOSED)
INSERT INTO chats (id, client_id, advisor_id, status, created_at, updated_at)
SELECT
    'chat-closed-1',
    c.id,
    a.id,
    'CLOSED',
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM
    (SELECT id FROM users WHERE role = 'CLIENT' LIMIT 1) c,
    (SELECT id FROM users WHERE role = 'ADVISOR' LIMIT 1) a;

-- Messages pour le chat fermé
INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-closed-1-1',
    'chat-closed-1',
    u.id,
    'Bonjour, j\'ai une question sur ma carte bancaire. Comment augmenter mon plafond ?',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 7 DAY)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-closed-1-2',
    'chat-closed-1',
    u.id,
    'Bonjour ! Pour augmenter votre plafond, vous pouvez faire la demande directement depuis votre espace client, section "Paramètres de carte". La modification sera effective sous 24h.',
    TRUE,
    DATE_SUB(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 23 HOUR)
FROM users u
WHERE u.role = 'ADVISOR'
LIMIT 1;

INSERT INTO messages (id, chat_id, sender_id, content, is_read, created_at)
SELECT
    'msg-closed-1-3',
    'chat-closed-1',
    u.id,
    'Parfait, merci beaucoup pour votre aide !',
    TRUE,
    DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM users u
WHERE u.role = 'CLIENT'
LIMIT 1;

-- Afficher un résumé des données insérées
SELECT
    'Chats créés' as type,
    COUNT(*) as count,
    status
FROM chats
GROUP BY status
UNION ALL
SELECT
    'Messages créés' as type,
    COUNT(*) as count,
    '' as status
FROM messages;
