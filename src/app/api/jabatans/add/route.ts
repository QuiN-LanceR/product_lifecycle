import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { jabatan } = await req.json();

    if (!jabatan) {
      return NextResponse.json(
        { success: false, message: 'Nama jabatan wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah jabatan sudah ada
    const existing = await getPool().query(
      'SELECT id FROM tbl_jabatan WHERE LOWER(jabatan) = LOWER($1)',
      [jabatan]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Jabatan dengan nama tersebut sudah ada.' },
        { status: 409 }
      );
    }
    
    const createdAt = new Date();
    
    await getPool().query(
      `INSERT INTO tbl_jabatan (jabatan, created_at)
       VALUES ($1, $2)`,
      [jabatan, createdAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Jabatan berhasil ditambahkan.'
    });
  } catch (err) {
    console.error("Error adding jabatan:", err);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menambahkan jabatan.' 
    }, { status: 500 });
  }
}