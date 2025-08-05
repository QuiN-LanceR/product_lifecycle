import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const result = await getPool().query('SELECT id, stage FROM tbl_stage ORDER BY stage ASC');
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ 
      success: false,
      error: 'Gagal ambil data stage' 
    }, { status: 500 });
  }
}