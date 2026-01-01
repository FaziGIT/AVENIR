import { z } from 'zod';

// SCHEMAS FORMS
export const createStockFormSchema = z.object({
    symbol: z
        .string()
        .min(1, 'Le symbole est requis')
        .max(10, 'Le symbole ne peut pas dépasser 10 caractères')
        .regex(/^[A-Z0-9]+$/, 'Le symbole doit contenir uniquement des lettres majuscules et chiffres'),
    name: z
        .string()
        .min(1, 'Le nom est requis')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    currentPrice: z
        .string()
        .min(1, 'Le prix est requis')
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Le prix doit être supérieur à 0'),
    marketCap: z
        .string()
        .optional()
        .nullable(),
    isActive: z.boolean().optional(),
});

export const updateStockFormSchema = z.object({
    id: z.string().uuid(),
    symbol: z
        .string()
        .max(10, 'Le symbole ne peut pas dépasser 10 caractères')
        .regex(/^[A-Z0-9]+$/, 'Le symbole doit contenir uniquement des lettres majuscules et chiffres')
        .optional(),
    name: z
        .string()
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .optional(),
    currentPrice: z
        .string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Le prix doit être supérieur à 0')
        .optional(),
    marketCap: z
        .string()
        .optional()
        .nullable(),
    isActive: z.boolean().optional(),
});

// SCHEMAS POUR L'API (Backend - avec numbers)
export const createStockApiSchema = z.object({
    symbol: z
        .string()
        .min(1, 'Le symbole est requis')
        .max(10, 'Le symbole ne peut pas dépasser 10 caractères')
        .regex(/^[A-Z0-9]+$/, 'Le symbole doit contenir uniquement des lettres majuscules et chiffres'),
    name: z
        .string()
        .min(1, 'Le nom est requis')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    currentPrice: z
        .number({ message: 'Le prix doit être un nombre' })
        .positive('Le prix doit être positif')
        .min(0.01, 'Le prix minimum est de 0.01€'),
    marketCap: z
        .number({ message: 'La capitalisation doit être un nombre' })
        .positive('La capitalisation doit être positive')
        .nullable()
        .optional(),
    isActive: z.boolean().default(true),
});

export const updateStockApiSchema = z.object({
    id: z.string().uuid('ID invalide'),
    symbol: z
        .string()
        .max(10, 'Le symbole ne peut pas dépasser 10 caractères')
        .regex(/^[A-Z0-9]+$/, 'Le symbole doit contenir uniquement des lettres majuscules et chiffres')
        .optional(),
    name: z
        .string()
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .optional(),
    currentPrice: z
        .number()
        .positive('Le prix doit être positif')
        .min(0.01, 'Le prix minimum est de 0.01€')
        .optional(),
    marketCap: z
        .number()
        .positive('La capitalisation doit être positive')
        .nullable()
        .optional(),
    isActive: z.boolean().optional(),
});

// TYPES FORMS
export type CreateStockFormInput = z.infer<typeof createStockFormSchema>;
export type UpdateStockFormInput = z.infer<typeof updateStockFormSchema>;

// TYPES API
export type CreateStockApiInput = z.infer<typeof createStockApiSchema>;
export type UpdateStockApiInput = z.infer<typeof updateStockApiSchema>;
