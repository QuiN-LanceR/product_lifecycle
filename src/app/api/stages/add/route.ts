import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const { stage, icon_light, icon_dark } = await req.json();

    if (!stage) {
      return NextResponse.json(
        { success: false, message: 'Nama stage wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah stage sudah ada
    const existing = await pool.query(
      'SELECT id FROM tbl_stage WHERE LOWER(stage) = LOWER($1)',
      [stage]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Stage dengan nama tersebut sudah ada.' },
        { status: 409 }
      );
    }
    
    const createdAt = new Date();
    
    await pool.query(
      `INSERT INTO tbl_stage (stage, icon_light, icon_dark, created_at)
       VALUES ($1, $2, $3, $4)`,
      [stage, icon_light || null, icon_dark || null, createdAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Stage berhasil ditambahkan.'
    });
  } catch (err) {
    console.error("Error adding stage:", err);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menambahkan stage.' 
    }, { status: 500 });
  }
}