// Database is only used in development for admin features
// In production, admin is disabled and this file is not used
let db: any = null;

if (process.env.NODE_ENV === 'development') {
  try {
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const schema = require('./schema');
    
    const sqlite = new Database('./portfolio.db');
    db = drizzle(sqlite, { schema });
  } catch (error) {
    // Database not available - admin features will be disabled
    console.warn('Database not available:', error);
  }
}

export { db };

