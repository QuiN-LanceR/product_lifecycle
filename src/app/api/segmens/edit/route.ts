import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const { id, segmen, icon_light, icon_dark } = await req.json();

  if (!id || !segmen) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    // Cek apakah segmen dengan nama yang sama sudah ada (selain segmen yang sedang diedit)
    const checkExisting = await client.query(
      `SELECT id FROM tbl_segmen WHERE LOWER(segmen) = LOWER($1) AND id != $2`,
      [segmen, id]
    );
    
    if (checkExisting.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Segmen dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }
    
    await client.query(
      `UPDATE tbl_segmen SET 
        segmen = $1,
        icon_light = $2,
        icon_dark = $3,
        updated_at = NOW()
      WHERE id = $4`,
      [segmen, icon_light || null, icon_dark || null, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Segmen berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update segmen error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}