import { User } from "./User";
import { Stock } from "./Stock";
import { OrderBook } from "./OrderBook";

export class Trade {
    constructor(
        readonly id: string,
        readonly stock: Stock,
        readonly buyer: User,
        readonly seller: User,
        readonly buyOrder: OrderBook,
        readonly sellOrder: OrderBook,
        readonly quantity: number,
        readonly price: number,
        readonly buyerFee: number,
        readonly sellerFee: number,
        readonly createdAt: Date,
    ) {}

    getTotalValue(): number {
        return this.quantity * this.price;
    }

    getBuyerTotal(): number {
        return this.getTotalValue() + this.buyerFee;
    }

    getSellerTotal(): number {
        return this.getTotalValue() - this.sellerFee;
    }
}
