import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { kategori, icon_light, icon_dark } = await req.json();

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah kategori sudah ada
    const existing = await getPool().query(
      'SELECT id FROM tbl_kategori WHERE LOWER(kategori) = LOWER($1)',
      [kategori]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Kategori dengan nama tersebut sudah ada.' },
        { status: 409 }
      );
    }
    
    const createdAt = new Date();
    
    await getPool().query(
      `INSERT INTO tbl_kategori (kategori, icon_light, icon_dark, created_at)
       VALUES ($1, $2, $3, $4)`,
      [kategori, icon_light || null, icon_dark || null, createdAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil ditambahkan.'
    });
  } catch (err) {
    console.error("Error adding kategori:", err);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menambahkan kategori.' 
    }, { status: 500 });
  }
}