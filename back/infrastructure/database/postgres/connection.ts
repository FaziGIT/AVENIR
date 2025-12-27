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
    connectionTimeoutMillis: 10000, // Increased from 2000ms to 10000ms
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    allowExitOnIdle: false,
});

pool.on('connect', () => {
    console.log('✓ PostgreSQL connecté');
});

pool.on('error', (err) => {
    console.error('✗ PostgreSQL erreur:', err);
    // Don't exit the process on pool errors, let the application handle it
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => {
        console.log('✓ PostgreSQL connection test successful');
    })
    .catch((err) => {
        console.error('✗ PostgreSQL connection test failed:', err);
    });
