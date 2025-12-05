import { Pool as MySQLPool } from 'mysql2/promise';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/repositories/UserRepository';
import { UserRole } from '../../../domain/enum/User/Role';
import { UserState } from '../../../domain/enum/User/State';
import { randomUUID } from 'crypto';

export class MySQLUserRepository implements UserRepository {
    constructor(private pool: MySQLPool) {}

    async add(user: User): Promise<User> {
        const userId = randomUUID();
        
        const insertQuery = `
            INSERT INTO users (id, first_name, last_name, email, identity_number, passcode, role, state, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const newUser = new User(
            userId,
            user.firstName,
            user.lastName,
            user.email,
            user.identityNumber,
            user.passcode,
            UserRole.CLIENT,
            UserState.ACTIVE,
            [],
            [],
            [],
            new Date()
        );

        try {
            await this.pool.execute(insertQuery, 
                [newUser.id,
                newUser.firstName,
                newUser.lastName,
                newUser.email,
                newUser.identityNumber,
                newUser.passcode,
                newUser.role,
                newUser.state,
                newUser.createdAt
            ]);
            return newUser;
        } catch (error) {
            console.error('Erreur MySQL:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.pool.execute('DELETE FROM users WHERE id = ?', [id]);
        } catch (error) {
            console.error('Erreur MySQL:', error);
            throw error;
        }
    }

    async update(user: User): Promise<void> {
        const query = `
            UPDATE users
            SET first_name = ?, last_name = ?, email = ?, 
                identity_number = ?, passcode = ?, role = ?, state = ?
            WHERE id = ?
        `;
        
        try {
            await this.pool.execute(query, [
                user.firstName,
                user.lastName,
                user.email,
                user.identityNumber,
                user.passcode,
                user.role,
                user.state,
                user.id
            ]);
        } catch (error) {
            console.error('Erreur MySQL:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            const [rows] = await this.pool.execute('SELECT * FROM users WHERE id = ?', [id]);
            const results = rows as any[];
            return results.length === 0 ? null : this.mapRowToUser(results[0]);
        } catch (error) {
            console.error('Erreur MySQL:', error);
            throw error;
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const [rows] = await this.pool.execute('SELECT * FROM users ORDER BY created_at DESC');
            const results = rows as any[];
            return results.map(row => this.mapRowToUser(row));
        } catch (error) {
            console.error('Erreur MySQL:', error);
            throw error;
        }
    }

    private mapRowToUser(row: any): User {
        return new User(
            row.id,
            row.first_name,
            row.last_name,
            row.email,
            row.identity_number,
            row.passcode,
            row.role as UserRole,
            row.state as UserState,
            [],
            [],
            [],
            new Date(row.created_at)
        );
    }
}

