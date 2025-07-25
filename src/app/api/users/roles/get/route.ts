import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({  
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const headers = new Headers();
    headers.append('Cache-Control', 'public, max-age=3600');
    
    const result = await pool.query('SELECT id, role FROM tbl_role');
    return NextResponse.json(result.rows, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data role' }, { status: 500 });
    console.log(error)
  }
}
