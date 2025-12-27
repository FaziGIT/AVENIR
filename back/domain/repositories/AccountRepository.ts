import { Account } from '../entities/Account';

export interface AccountRepository {
    add(account: Account): Promise<Account>;
    getById(id: string): Promise<Account | null>;
    getByUserId(userId: string): Promise<Account[]>;
    getByIban(iban: string): Promise<Account | null>;
    getByCardNumber(cardNumber: string): Promise<Account | null>;
    update(account: Account): Promise<Account>;
    remove(id: string): Promise<void>;
}
