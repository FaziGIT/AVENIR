/**
 * Account-related Value Objects
 * Immutable objects representing IBAN and Card concepts
 * Both are exclusively used by the Account entity
 */

/**
 * IBAN Value Object
 * Represents an International Bank Account Number with validation
 * Uses MOD-97-10 algorithm for validation
 */
export class Iban {
    private static readonly COUNTRY_CODE = 'FR';
    private static readonly BBAN_LENGTH = 23;

    private constructor(private readonly value: string) {
        if (!Iban.validate(value)) {
            throw new Error(`Invalid IBAN: ${value}`);
        }
    }

    /**
     * Creates an IBAN from a string value
     * @param value The IBAN string
     * @returns Iban instance
     * @throws Error if IBAN is invalid
     */
    static create(value: string): Iban {
        return new Iban(value);
    }

    /**
     * Generates a new valid IBAN
     * @returns Iban instance
     */
    static generate(): Iban {
        // Generate random BBAN
        const bankCode = this.generateRandomDigits(5);
        const branchCode = this.generateRandomDigits(5);
        const accountNumber = this.generateRandomAlphanumeric(11);
        const bban = bankCode + branchCode + accountNumber + '00';

        // Calculate check digits
        const checkDigits = this.calculateCheckDigits(this.COUNTRY_CODE + '00' + bban);
        const ibanString = this.COUNTRY_CODE + checkDigits + bban;

        return new Iban(ibanString);
    }

    /**
     * Validates an IBAN using MOD-97-10 algorithm
     */
    static validate(iban: string): boolean {
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();

        if (cleanIban.length < 15 || cleanIban.length > 34) {
            return false;
        }

        const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);

        let numericString = '';
        for (const char of rearranged) {
            if (char >= '0' && char <= '9') {
                numericString += char;
            } else if (char >= 'A' && char <= 'Z') {
                numericString += (char.charCodeAt(0) - 55).toString();
            } else {
                return false;
            }
        }

        let remainder = 0;
        for (let i = 0; i < numericString.length; i++) {
            remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
        }

        return remainder === 1;
    }

    /**
     * Returns the IBAN string value
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Returns formatted IBAN (with spaces every 4 characters)
     */
    getFormatted(): string {
        return this.value.replace(/(.{4})/g, '$1 ').trim();
    }

    /**
     * Checks equality with another IBAN
     */
    equals(other: Iban): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    private static calculateCheckDigits(ibanWithoutCheckDigits: string): string {
        const rearranged = ibanWithoutCheckDigits.substring(4) + ibanWithoutCheckDigits.substring(0, 4);

        let numericString = '';
        for (const char of rearranged) {
            if (char >= '0' && char <= '9') {
                numericString += char;
            } else if (char >= 'A' && char <= 'Z') {
                numericString += (char.charCodeAt(0) - 55).toString();
            }
        }

        let remainder = 0;
        for (let i = 0; i < numericString.length; i++) {
            remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
        }

        const checkDigits = (98 - remainder).toString().padStart(2, '0');
        return checkDigits;
    }

    private static generateRandomDigits(length: number): string {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    }

    private static generateRandomAlphanumeric(length: number): string {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

/**
 * Card Value Object
 * Represents a bank card with its details (number, expiry, CVV, holder name)
 */
export class Card {
    private constructor(
        private readonly number: string,
        private readonly holderName: string,
        private readonly expiryDate: string,
        private readonly cvv: string
    ) {
        this.validate();
    }

    /**
     * Creates a Card from its components
     */
    static create(
        number: string,
        holderName: string,
        expiryDate: string,
        cvv: string
    ): Card {
        return new Card(number, holderName, expiryDate, cvv);
    }

    /**
     * Generates a new card with random but valid data
     * @param holderName The name to appear on the card
     * @returns Card instance
     */
    static generate(holderName: string): Card {
        const number = this.generateCardNumber();
        const expiryDate = this.generateExpiryDate();
        const cvv = this.generateCvv();
        return new Card(number, holderName, expiryDate, cvv);
    }

    /**
     * Generates a 16-digit card number (Visa format starts with 4)
     */
    private static generateCardNumber(): string {
        const prefix = '4';
        const randomDigits = Math.floor(Math.random() * 1000000000000000)
            .toString()
            .padStart(15, '0');
        return `${prefix}${randomDigits}`;
    }

    /**
     * Generates expiry date 5 years from now (MM/YY format)
     */
    private static generateExpiryDate(): string {
        const now = new Date();
        const expiryYear = (now.getFullYear() + 5) % 100;
        const expiryMonth = Math.floor(Math.random() * 12) + 1;
        return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear
            .toString()
            .padStart(2, '0')}`;
    }

    /**
     * Generates a 3-digit CVV
     */
    private static generateCvv(): string {
        return Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
    }

    /**
     * Validates card data
     */
    private validate(): void {
        if (!this.number || this.number.length !== 16) {
            throw new Error('Card number must be 16 digits');
        }
        if (!this.holderName || this.holderName.trim().length === 0) {
            throw new Error('Card holder name is required');
        }
        if (!this.expiryDate || !/^\d{2}\/\d{2}$/.test(this.expiryDate)) {
            throw new Error('Expiry date must be in MM/YY format');
        }
        if (!this.cvv || this.cvv.length !== 3) {
            throw new Error('CVV must be 3 digits');
        }
    }

    // Getters
    getNumber(): string {
        return this.number;
    }

    getHolderName(): string {
        return this.holderName;
    }

    getExpiryDate(): string {
        return this.expiryDate;
    }

    getCvv(): string {
        return this.cvv;
    }

    /**
     * Returns masked card number (shows only last 4 digits)
     */
    getMaskedNumber(): string {
        return `****${this.number.slice(-4)}`;
    }

    /**
     * Checks equality with another Card
     */
    equals(other: Card): boolean {
        return (
            this.number === other.number &&
            this.holderName === other.holderName &&
            this.expiryDate === other.expiryDate
        );
    }
}

