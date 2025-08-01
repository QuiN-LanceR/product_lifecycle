import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const { id, kategori, icon_light, icon_dark } = await req.json();

  if (!id || !kategori) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    // Cek apakah kategori dengan nama yang sama sudah ada (selain kategori yang sedang diedit)
    const checkExisting = await client.query(
      `SELECT id FROM tbl_kategori WHERE LOWER(kategori) = LOWER($1) AND id != $2`,
      [kategori, id]
    );
    
    if (checkExisting.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }
    
    await client.query(
      `UPDATE tbl_kategori SET 
        kategori = $1,
        icon_light = $2,
        icon_dark = $3,
        updated_at = NOW()
      WHERE id = $4`,
      [kategori, icon_light || null, icon_dark || null, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Kategori berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update kategori error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}