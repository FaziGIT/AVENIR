import { Order } from "./Order";

export class Stock {
    constructor(
        readonly id: string,
        readonly symbol: string,
        readonly name: string,
        readonly isin: string | null,
        readonly currentPrice: number,
        readonly bestBid: number | null,
        readonly bestAsk: number | null,
        readonly marketCap: number | null,
        readonly volume24h: number,
        readonly isActive: boolean,
        readonly orders: Order[] = [],
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    getSpread(): number | null {
        if (this.bestAsk && this.bestBid) {
            return this.bestAsk - this.bestBid;
        }
        return null;
    }

    getSpreadPercentage(): number | null {
        const spread = this.getSpread();
        if (spread && this.currentPrice > 0) {
            return (spread / this.currentPrice) * 100;
        }
        return null;
    }
}
