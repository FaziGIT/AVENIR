import { User } from "./User";
import { OrderType } from "../enumerations/OrderType";
import { Action } from "./Action";
import { OrderState } from "../enumerations/OrderState";

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