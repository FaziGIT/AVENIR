import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const { Pool } = pg;

async function initDb() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'avenir_user',
    password: process.env.DB_PASSWORD || 'avenir_password',
    database: process.env.DB_NAME || 'avenir_db',
  });

  try {
    // Run init.sql (uses IF NOT EXISTS, safe to re-run)
    const initSql = fs.readFileSync(
      path.join(__dirname, 'infrastructure/database/postgres/init.sql'),
      'utf8'
    );
    await pool.query(initSql);
    console.log('✓ Database schema initialized');

    // Run migrations in order
    const migrationsDir = path.join(__dirname, 'infrastructure/database/postgres/migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        try {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await pool.query(sql);
          console.log(`  ✓ Migration: ${file}`);
        } catch (err: any) {
          // Skip already-applied migrations (e.g. column already exists)
          if (err.code === '42701' || err.code === '42P07' || err.code === '42710') {
            console.log(`  - Migration already applied: ${file}`);
          } else {
            throw err;
          }
        }
      }
      console.log('✓ All migrations applied');
    }

    // Load fixtures
    const fixturesDir = path.join(__dirname, 'infrastructure/database/postgres/fixtures');
    if (fs.existsSync(fixturesDir)) {
      const files = fs.readdirSync(fixturesDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        try {
          const sql = fs.readFileSync(path.join(fixturesDir, file), 'utf8');
          await pool.query(sql);
          console.log(`  ✓ Fixture: ${file}`);
        } catch (err: any) {
          // Skip if data already exists (duplicate key)
          if (err.code === '23505') {
            console.log(`  - Fixture already loaded: ${file}`);
          } else {
            throw err;
          }
        }
      }
      console.log('✓ All fixtures loaded');
    }
  } finally {
    await pool.end();
  }
}

initDb()
  .then(() => console.log('✓ Database ready'))
  .catch((err) => {
    console.error('✗ Database initialization failed:', err);
    process.exit(1);
  });
