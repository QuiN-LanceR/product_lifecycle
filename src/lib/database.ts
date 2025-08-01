import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // maksimal 20 koneksi simultan
      idleTimeoutMillis: 30000, // tutup koneksi idle setelah 30 detik
      connectionTimeoutMillis: 2000, // timeout koneksi 2 detik
      allowExitOnIdle: true // izinkan process exit ketika semua koneksi idle
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  return pool;
}

// Function untuk menutup pool (untuk cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}