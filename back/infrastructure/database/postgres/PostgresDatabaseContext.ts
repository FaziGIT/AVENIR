import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { PostgresUserRepository } from '../../adapters/repositories/postgres/PostgresUserRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class PostgresDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;

    constructor() {
        this.userRepository = new PostgresUserRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
