-- Fixtures pour les crédits (MySQL)
-- Ce fichier contient les données de test pour le système de crédits

-- Définir l'encodage UTF-8
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

-- Nettoyer les données existantes
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE loans;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- CRÉDITS DE TEST (7 crédits réalistes)
-- =========================================

-- Loan 1: Clement Tine - Crédit immobilier (advisor: Marie Martin)
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-001',
  'Crédit immobilier',
  'b2c3d4e5-6f7a-4b9c-8d1e-2f3a4b5c6d7e',
  'e5f6a7b8-9c0d-41e2-bf4a-5c6d7e8f9a0b',
  200000.00,
  240,
  3.50,
  0.36,
  1054.78,
  253147.20,
  52427.20,
  720.00,
  13712.14,
  'ACTIVE',
  '2024-12-15 10:00:00',
  NOW(),
  '2024-12-15 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 2: Clement Tine (CLIENT001) - Crédit auto DEFAULTED
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-002',
  'Crédit automobile',
  'b2c3d4e5-6f7a-4b9c-8d1e-2f3a4b5c6d7e',
  'e5f6a7b8-9c0d-41e2-bf4a-5c6d7e8f9a0b',
  25000.00,
  60,
  4.00,
  0.50,
  468.75,
  28125.00,
  2875.00,
  125.00,
  4687.50,
  'DEFAULTED',
  '2025-02-20 10:00:00',
  NOW(),
  '2025-02-20 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 3: Jean Dupont (CLIENT002) - Crédit travaux ACTIF (31 mois payés / 120)
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-003',
  'Crédit travaux',
  'b2c3d4e5-6f7a-4b9c-8d1e-2f3a4b5c6d7e',
  'f6a7b8c9-0d1e-42f3-8f5b-6d7e8f9a0b1c',
  50000.00,
  120,
  3.80,
  0.40,
  504.17,
  60500.40,
  10300.40,
  200.00,
  15629.27,
  'ACTIVE',
  '2023-06-15 10:00:00',
  NOW(),
  '2023-06-15 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 4: Emma Leroy (CLIENT003) - Crédit personnel COMPLETED
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-004',
  'Crédit personnel',
  'c3d4e5f6-7a8b-4c9d-9e2f-3a4b5c6d7e8f',
  'a7b8c9d0-1e2f-43a4-9f6c-7e8f9a0b1c2d',
  15000.00,
  48,
  5.00,
  0.45,
  345.83,
  16599.84,
  1532.34,
  67.50,
  16599.84,
  'COMPLETED',
  '2021-12-10 10:00:00',
  '2025-12-10 10:00:00',
  '2021-12-10 10:00:00',
  NULL
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 5: Lucas Moreau (CLIENT004) - Crédit étudiant ACTIF (25 mois payés / 60)
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-005',
  'Crédit étudiant',
  'c3d4e5f6-7a8b-4c9d-9e2f-3a4b5c6d7e8f',
  'b8c9d0e1-2f3a-44b5-af7d-8f9a0b1c2d3e',
  10000.00,
  60,
  2.50,
  0.30,
  177.92,
  10675.20,
  645.20,
  30.00,
  4448.00,
  'ACTIVE',
  '2023-12-10 10:00:00',
  NOW(),
  '2023-12-10 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 6: Léa Simon (CLIENT005) - Crédit renovation DEFAULTED
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-006',
  'Crédit rénovation',
  'd4e5f6a7-8b9c-4d0e-af3a-4b5c6d7e8f9a',
  'c9d0e1f2-3a4b-45c6-bf8e-9a0b1c2d3e4f',
  30000.00,
  84,
  4.20,
  0.38,
  403.57,
  33900.00,
  3786.00,
  114.00,
  2421.42,
  'DEFAULTED',
  '2025-06-10 10:00:00',
  NOW(),
  '2025-06-10 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Loan 7: Jean Dupont (CLIENT002) - Crédit voiture ACTIF (récent)
INSERT INTO loans (id, name, advisor_id, client_id, amount, duration, annual_interest_rate, insurance_rate, monthly_payment, total_cost, total_interest, insurance_cost, paid_amount, status, created_at, updated_at, delivered_at, next_payment_date)
VALUES (
  'loan-007',
  'Crédit voiture',
  'b2c3d4e5-6f7a-4b9c-8d1e-2f3a4b5c6d7e',
  'f6a7b8c9-0d1e-42f3-8f5b-6d7e8f9a0b1c',
  18000.00,
  48,
  4.50,
  0.42,
  410.25,
  19692.00,
  1616.00,
  76.00,
  0.00,
  'ACTIVE',
  '2025-12-20 10:00:00',
  NOW(),
  '2025-12-20 10:00:00',
  '2026-02-01 10:00:00'
) ON DUPLICATE KEY UPDATE id = id;

-- Afficher le résumé
SELECT 'Crédits créés' as info, COUNT(*) as count, SUM(amount) as total FROM loans;
SELECT 'Par statut' as info, status, COUNT(*) as count FROM loans GROUP BY status;
