import { User } from "./User";
export class Message {
    public constructor(
        public readonly id: string,
        public readonly sender: User,
        public readonly content: string,
        public readonly createdAt: Date,
    ) {}
}