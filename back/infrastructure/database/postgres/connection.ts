import { Pool } from 'pg';
import { databaseConfig } from '../../config/database.config';

export const pool = new Pool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    user: databaseConfig.username,
    password: databaseConfig.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✓ PostgreSQL connecté');
});

pool.on('error', (err) => {
    console.error('✗ PostgreSQL erreur:', err);
});
