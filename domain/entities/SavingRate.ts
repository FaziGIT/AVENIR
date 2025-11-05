import { User } from "./User";

export class SavingRate {
    public constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly director: User,
        public readonly rate: number,
        public readonly createdAt: Date,
    ) {}
}