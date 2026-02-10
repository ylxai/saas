// lib/db.ts
import { Pool } from '@neondatabase/serverless';
import { config } from './config';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    if (!config.database.url) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    pool = new Pool({ connectionString: config.database.url });
  }
  
  return pool;
}

// Fungsi helper untuk query database
export async function query(text: string, params?: (string | number | boolean | Date | null | undefined)[]) {
  const client = await getDbPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Definisi tabel untuk digunakan di aplikasi
export const TABLES = {
  EVENTS: 'events',
  FILES: 'files',
  CLIENTS: 'clients',
  SELECTIONS: 'selections',
  PROCESSING_LOG: 'processing_log',
};

// Fungsi untuk inisialisasi skema database
export async function initializeSchema() {
  const schemaQueries = [
    // Tabel events
    `CREATE TABLE IF NOT EXISTS ${TABLES.EVENTS} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      folder_path TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
      photo_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabel clients
    `CREATE TABLE IF NOT EXISTS ${TABLES.CLIENTS} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabel files
    `CREATE TABLE IF NOT EXISTS ${TABLES.FILES} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES ${TABLES.EVENTS}(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      is_selected BOOLEAN DEFAULT FALSE,
      file_type VARCHAR(10) CHECK (file_type IN ('RAW', 'JPG', 'OTHER')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Tabel selections
    `CREATE TABLE IF NOT EXISTS ${TABLES.SELECTIONS} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      file_id UUID REFERENCES ${TABLES.FILES}(id) ON DELETE CASCADE,
      client_id UUID REFERENCES ${TABLES.CLIENTS}(id) ON DELETE CASCADE,
      selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
    );`,
    
    // Tabel processing_log
    `CREATE TABLE IF NOT EXISTS ${TABLES.PROCESSING_LOG} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      file_id UUID REFERENCES ${TABLES.FILES}(id) ON DELETE CASCADE,
      action VARCHAR(20) NOT NULL CHECK (action IN ('copy', 'move', 'edit', 'delete')),
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'in-progress')),
      details TEXT
    );`,
    
    // Index untuk performa
    `CREATE INDEX IF NOT EXISTS idx_files_event_id ON ${TABLES.FILES}(event_id);`,
    `CREATE INDEX IF NOT EXISTS idx_files_is_selected ON ${TABLES.FILES}(is_selected);`,
    `CREATE INDEX IF NOT EXISTS idx_selections_client_id ON ${TABLES.SELECTIONS}(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_selections_status ON ${TABLES.SELECTIONS}(status);`,
  ];

  for (const queryText of schemaQueries) {
    await query(queryText);
  }
}