import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const { id, stage, icon_light, icon_dark } = await req.json();

  if (!id || !stage) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    // Cek apakah stage dengan nama yang sama sudah ada (selain stage yang sedang diedit)
    const checkExisting = await client.query(
      `SELECT id FROM tbl_stage WHERE LOWER(stage) = LOWER($1) AND id != $2`,
      [stage, id]
    );
    
    if (checkExisting.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Stage dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }
    
    await client.query(
      `UPDATE tbl_stage SET 
        stage = $1,
        icon_light = $2,
        icon_dark = $3,
        updated_at = NOW()
      WHERE id = $4`,
      [stage, icon_light || null, icon_dark || null, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Stage berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update stage error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}