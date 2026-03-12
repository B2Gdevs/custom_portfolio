// Database is only used in development for admin features
// In production, admin is disabled and this file is not used
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from './schema';

type DbType = BetterSQLite3Database<typeof schema>;
let db: DbType | null = null;

if (process.env.NODE_ENV === 'development') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic CJS for optional better-sqlite3
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schemaModule = require('./schema');
    
    const sqlite = new Database('./portfolio.db');
    db = drizzle(sqlite, { schema: schemaModule });
  } catch (_err) {
    // Database not available - admin features will be disabled
    console.warn('Database not available:', _err);
  }
}

export { db };

