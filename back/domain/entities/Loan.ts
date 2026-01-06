export class Loan {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly advisorId: string,
        public readonly clientId: string,
        public readonly amount: number,
        public readonly duration: number,
        public readonly annualInterestRate: number,
        public readonly insuranceRate: number,
        public readonly monthlyPayment: number,
        public readonly totalCost: number,
        public readonly totalInterest: number,
        public readonly insuranceCost: number,
        public readonly paidAmount: number,
        public readonly status: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly nextPaymentDate?: Date,
    ) {}

    get remainingPayment(): number {
        return Math.round((this.totalCost - this.paidAmount) * 100) / 100;
    }

    get progressPercentage(): number {
        if (this.totalCost === 0) return 0;
        return Math.round((this.paidAmount / this.totalCost) * 10000) / 100;
    }

    get monthsPaid(): number {
        if (this.monthlyPayment === 0) return 0;
        return Math.floor(this.paidAmount / this.monthlyPayment);
    }
}
