import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const { id, segmen } = await req.json();

  if (!id || !segmen) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
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
        updated_at = NOW()
      WHERE id = $2`,
      [segmen, id]
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