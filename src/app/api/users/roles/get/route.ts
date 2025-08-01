import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const headers = new Headers();
    headers.append('Cache-Control', 'public, max-age=3600');
    
    const result = await getPool().query('SELECT id, role FROM tbl_role');
    return NextResponse.json(result.rows, { headers });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data role' }, { status: 500 });
  }
}
