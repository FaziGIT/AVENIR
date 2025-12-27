export const AccountType = {
    CURRENT: 'CURRENT',
    SAVINGS: 'SAVINGS'
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

