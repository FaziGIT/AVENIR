import { Order } from "./Order";
import { User } from "./User";

export class Action {
    constructor(
        readonly id: string,
        readonly director: User,
        readonly name: string,
        readonly symbol: string,
        readonly currentPrice: number,
        readonly isActive: boolean,
        readonly orders: Order[] = [],
        readonly createdAt: Date,
    ) {}
}