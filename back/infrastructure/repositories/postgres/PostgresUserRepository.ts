import { Pool } from 'pg';
import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/repositories/UserRepository';
import { UserRole } from '../../../domain/enum/User/Role';
import { UserState } from '../../../domain/enum/User/State';
import { randomUUID } from 'crypto';
export class PostgresUserRepository implements UserRepository {
    constructor(private pool: Pool) {}

    async add(user: User): Promise<User> {
        const query = `
            INSERT INTO users (id, first_name, last_name, email, identity_number, role, state, passcode, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        try {
            const result = await this.pool.query(query, [
                randomUUID(),
                user.firstName,
                user.lastName,
                user.email,
                user.identityNumber,
                UserRole.CLIENT,
                UserState.ACTIVE,
                user.passcode,
                new Date()
            ]);
            return this.mapRowToUser(result.rows[0]);
        } catch (error) {
            console.error('Erreur PostgreSQL:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (error) {
            console.error('Erreur PostgreSQL:', error);
            throw error;
        }
    }

    async update(user: User): Promise<void> {
        const query = `
            UPDATE users
            SET first_name = $2, last_name = $3, email = $4, 
                identity_number = $5, passcode = $6, role = $7, state = $8
            WHERE id = $1
        `;
        
        try {
            await this.pool.query(query, [
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.identityNumber,
                user.passcode,
                user.role,
                user.state
            ]);
        } catch (error) {
            console.error('Erreur PostgreSQL:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows.length === 0 ? null : this.mapRowToUser(result.rows[0]);
        } catch (error) {
            console.error('Erreur PostgreSQL:', error);
            throw error;
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const result = await this.pool.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows.map(row => this.mapRowToUser(row));
        } catch (error) {
            console.error('Erreur PostgreSQL:', error);
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

