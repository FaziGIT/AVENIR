import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { PostgresUserRepository } from '../../repositories/postgres/PostgresUserRepository';

export class PostgresDatabaseContext implements DatabaseContext {
    public readonly userRepository: PostgresUserRepository;

    constructor() {
        this.userRepository = new PostgresUserRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
