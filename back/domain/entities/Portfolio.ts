import { User } from "./User";
import { Stock } from "./Stock";

export class Portfolio {
    constructor(
        readonly id: string,
        readonly user: User,
        readonly stock: Stock,
        readonly quantity: number,
        readonly averageBuyPrice: number,
        readonly totalInvested: number,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    getCurrentValue(): number {
        return this.quantity * this.stock.currentPrice;
    }

    getProfitLoss(): number {
        return this.getCurrentValue() - this.totalInvested;
    }

    getProfitLossPercentage(): number {
        if (this.totalInvested === 0) return 0;
        return (this.getProfitLoss() / this.totalInvested) * 100;
    }
}
