import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .min(1, 'La description est requise')
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères'),
});

export type CreateNewsFormData = z.infer<typeof createNewsSchema>;

export const sendNotificationSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  message: z
    .string()
    .min(1, 'Le message est requis')
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

export type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;

export const grantLoanSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du crédit est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  amount: z
    .number({ message: 'Le montant doit être un nombre' })
    .positive('Le montant doit être positif')
    .min(100, 'Le montant minimum est de 100€')
    .max(1000000000, 'Le montant maximum est de 1 000 000 000€'),
  duration: z
    .number({ message: 'La durée doit être un nombre' })
    .int('La durée doit être un nombre entier')
    .positive('La durée doit être positive')
    .min(3, 'La durée minimum est de 3 mois')
    .max(372, 'La durée maximum est de 372 mois (40 ans)'),
  interestRate: z
    .number({ message: 'Le taux d\'intérêt doit être un nombre' })
    .positive('Le taux d\'intérêt doit être positif')
    .min(0.1, 'Le taux minimum est de 0.1%')
    .max(20, 'Le taux maximum est de 20%'),
  insuranceRate: z
    .number({ message: 'Le taux d\'assurance doit être un nombre' })
    .nonnegative('Le taux d\'assurance ne peut pas être négatif')
    .max(7, 'Le taux d\'assurance maximum est de 7%'),
});

export type GrantLoanFormData = z.infer<typeof grantLoanSchema>;
