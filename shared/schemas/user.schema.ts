import { z } from 'zod';
import { UserRole } from '../enums/UserRole';
import { UserState } from '../enums/UserState';

export const UserRoleSchema = z.enum(UserRole);
export const UserStateSchema = z.enum(UserState);

export const addUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
    email: z.email('Invalid email format'),
    identityNumber: z.string().min(1, 'Identity number is required'),
    passcode: z.string().min(4, 'Passcode must be at least 4 characters'),
    role: UserRoleSchema,
});

export const getUserSchema = z.object({
    userId: z.uuid('Invalid user ID format'),
});

export const updateUserSchema = z.object({
    userId: z.uuid('Invalid user ID format'),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.email('Invalid email format').optional(),
    state: UserStateSchema.optional(),
});

// Validation IBAN simplifiée
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

export const deleteUserWithIBANSchema = z.object({
    userId: z.uuid('Invalid user ID format'),
    transferIBAN: z.string()
        .min(15, 'IBAN must be at least 15 characters')
        .max(34, 'IBAN must not exceed 34 characters')
        .regex(ibanRegex, 'Invalid IBAN format (e.g., FR7630006000011234567890189)')
        .transform(val => val.replace(/\s/g, '').toUpperCase()), // Enlever espaces et mettre en majuscules
});

export type AddUserInput = z.infer<typeof addUserSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserWithIBANInput = z.infer<typeof deleteUserWithIBANSchema>;
