import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT id, kategori FROM tbl_kategori ORDER BY kategori ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Gagal ambil data kategori' }, { status: 500 });
  }
}