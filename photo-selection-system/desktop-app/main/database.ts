// main/database.ts
import { neon, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure NeonDB for serverless
neonConfig.wsProxy = (host) => `wss://${host}`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = false;
neonConfig.forceSSL = false;

let sql: ReturnType<typeof neon> | null = null;

export async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Create new SQL client
    sql = neon(process.env.DATABASE_URL);
    
    // Test connection
    await sql`SELECT 1`;
    
    console.log('Connected to NeonDB successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabaseClient() {
  if (!sql) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return sql;
}