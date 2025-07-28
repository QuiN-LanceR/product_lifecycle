import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { kategori } = await req.json();

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Nama kategori wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah kategori sudah ada
    const existing = await pool.query(
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
    
    await pool.query(
      `INSERT INTO tbl_kategori (kategori, created_at)
       VALUES ($1, $2)`,
      [kategori, createdAt]
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