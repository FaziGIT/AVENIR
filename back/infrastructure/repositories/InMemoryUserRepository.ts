import { User } from '../../domain/entities/User';
import { UserRepository } from '../../application/ports/repositories/UserRepository';
import { UserRole } from '../../domain/enum/User/Role';
import { UserState } from '../../domain/enum/User/State';

export class InMemoryUserRepository implements UserRepository {
    private users: Map<string, User> = new Map();

    constructor() {
        // Données mock pour l'exemple
        const mockUser = new User(
            '1',
            'John',
            'Doe',
            'john.doe@example.com',
            '123456789',
            'hashedPassword',
            UserRole.CLIENT,
            UserState.ACTIVE,
            [],
            [],
            [],
            new Date()
        );
        this.users.set('1', mockUser);
    }

    async add(user: User): Promise<User> {
        this.users.set(user.id, user);
        console.log(this.users);
        return user;
    }

    async remove(id: string): Promise<void> {
        this.users.delete(id);
    }

    async update(user: User): Promise<void> {
        this.users.set(user.id, user);
    }

    async getById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async getAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }
}



