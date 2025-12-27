import { Account } from '../entities/Account';
import { AccountType } from '../enumerations/AccountType';
import { AccountRepository } from '../repositories/AccountRepository';
import { Iban, Card } from '../value-objects/Account';

/**
 * Account Factory (Domain Service)
 * 
 * Factory Pattern: Creates complex Account aggregates with all necessary data
 * Handles the complexity of generating unique IBANs and cards
 * 
 * Note: Only CURRENT accounts come with cards. SAVINGS accounts do not have cards.
 */
export class AccountFactory {
    constructor(private readonly accountRepository: AccountRepository) {}

    /**
     * Creates a new account
     * CURRENT accounts come with a card, SAVINGS accounts do not
     * 
     * @param id Account ID
     * @param userId Owner of the account
     * @param name Account name
     * @param type Account type (CURRENT or SAVINGS)
     * @param holderName Card holder name (only used for CURRENT accounts)
     * @param balance Initial balance (default: 0)
     * @param currency Currency (default: 'EUR')
     * @returns Promise<Account>
     */
    async createAccount(
        id: string,
        userId: string,
        name: string,
        type: AccountType,
        holderName: string,
        balance: number = 0,
        currency: string = 'EUR'
    ): Promise<Account> {
        const iban = await this.generateUniqueIban();

        let cardNumber: string | null = null;
        let cardHolderName: string | null = null;
        let cardExpiryDate: string | null = null;
        let cardCvv: string | null = null;

        if (type === AccountType.CURRENT) {
            const card = await this.generateUniqueCard(holderName);
            cardNumber = card.getNumber();
            cardHolderName = card.getHolderName();
            cardExpiryDate = card.getExpiryDate();
            cardCvv = card.getCvv();
        }

        return new Account(
            id,
            userId,
            iban.getValue(),
            name,
            type,
            balance,
            currency,
            cardNumber,
            cardHolderName,
            cardExpiryDate,
            cardCvv,
            null,
            [],
            new Date()
        );
    }

    /**
     * Generates a unique IBAN by checking against existing accounts
     */
    private async generateUniqueIban(maxAttempts: number = 10): Promise<Iban> {
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            const iban = Iban.generate();
            const existingAccount = await this.accountRepository.getByIban(
                iban.getValue()
            );

            if (!existingAccount) {
                return iban;
            }
        }

        throw new Error('Unable to generate unique IBAN after multiple attempts');
    }

    /**
     * Generates a unique card by checking against existing accounts
     */
    private async generateUniqueCard(
        holderName: string,
        maxAttempts: number = 10
    ): Promise<Card> {
        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            const card = Card.generate(holderName);
            const existingAccount = await this.accountRepository.getByCardNumber(
                card.getNumber()
            );

            if (!existingAccount) {
                return card;
            }
        }

        throw new Error('Unable to generate unique card number after multiple attempts');
    }
}

