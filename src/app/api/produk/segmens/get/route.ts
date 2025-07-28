import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT id, segmen FROM tbl_segmen ORDER BY segmen ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Gagal ambil data segmen' }, { status: 500 });
  }
}