import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const result = await getPool().query('SELECT id, kategori FROM tbl_kategori ORDER BY kategori ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Gagal ambil data kategori' }, { status: 500 });
  }
}