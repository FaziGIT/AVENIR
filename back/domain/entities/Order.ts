import { User } from "./User";
import { OrderType } from "../enum/Order/Type";
import { Action } from "./Action";
import { OrderState } from "../enum/Order/State";

export class Order {
    constructor(
        readonly id: string,
        readonly client: User,
        readonly action: Action,
        readonly type: OrderType,
        readonly numberOfActions: number,
        readonly purchasePrice: number,
        readonly salePrice: number,
        readonly state: OrderState,
        readonly fees: number = 1,
        readonly createdAt: Date,
    ) {}
}