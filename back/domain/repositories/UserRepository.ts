import { User } from "../entities/User";

export interface UserRepository {
    add(user: User): Promise<User>;
    remove(id: string): Promise<void>;
    update(user: User): Promise<void>;
    getById(id: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    getAll(): Promise<User[]>;
}