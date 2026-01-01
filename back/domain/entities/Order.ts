import { User } from "./User";
import { OrderType } from "../enumerations/OrderType";
import { Stock } from "./Stock";
import { OrderState } from "../enumerations/OrderState";

export class Order {
    constructor(
        readonly id: string,
        readonly client: User,
        readonly stock: Stock,
        readonly type: OrderType,
        readonly numberOfShares: number,
        readonly purchasePrice: number,
        readonly salePrice: number,
        readonly state: OrderState,
        readonly fees: number = 1,
        readonly createdAt: Date,
    ) {}

    getTotalCost(): number {
        return this.purchasePrice + this.fees;
    }

    getTotalValue(): number {
        return this.numberOfShares * this.purchasePrice;
    }
}