import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const { id, jabatan } = await req.json();

  if (!id || !jabatan) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    // Cek apakah jabatan dengan nama yang sama sudah ada (selain jabatan yang sedang diedit)
    const checkExisting = await client.query(
      `SELECT id FROM tbl_jabatan WHERE LOWER(jabatan) = LOWER($1) AND id != $2`,
      [jabatan, id]
    );
    
    if (checkExisting.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Jabatan dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }
    
    await client.query(
      `UPDATE tbl_jabatan SET 
        jabatan = $1,
        updated_at = NOW()
      WHERE id = $2`,
      [jabatan, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Jabatan berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update jabatan error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}