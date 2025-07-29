import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { segmen, icon_light, icon_dark } = await req.json();

    if (!segmen) {
      return NextResponse.json(
        { success: false, message: 'Nama segmen wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah segmen sudah ada
    const existing = await pool.query(
      'SELECT id FROM tbl_segmen WHERE LOWER(segmen) = LOWER($1)',
      [segmen]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Segmen dengan nama tersebut sudah ada.' },
        { status: 409 }
      );
    }
    
    const createdAt = new Date();
    
    await pool.query(
      `INSERT INTO tbl_segmen (segmen, icon_light, icon_dark, created_at)
       VALUES ($1, $2, $3, $4)`,
      [segmen, icon_light || null, icon_dark || null, createdAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Segmen berhasil ditambahkan.'
    });
  } catch (err) {
    console.error("Error adding segmen:", err);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menambahkan segmen.' 
    }, { status: 500 });
  }
}