import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Nama role wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah role sudah ada
    const existing = await getPool().query(
      'SELECT id FROM tbl_role WHERE LOWER(role) = LOWER($1)',
      [role]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Role dengan nama tersebut sudah ada.' },
        { status: 409 }
      );
    }
    
    const createdAt = new Date();
    
    await getPool().query(
      `INSERT INTO tbl_role (role, created_at)
       VALUES ($1, $2)`,
      [role, createdAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Role berhasil ditambahkan.'
    });
  } catch (err) {
    console.error("Error adding role:", err);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menambahkan role.' 
    }, { status: 500 });
  }
}