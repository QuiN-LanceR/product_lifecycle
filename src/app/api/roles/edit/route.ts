import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const { id, role } = await req.json();

  if (!id || !role) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    // Cek apakah role dengan nama yang sama sudah ada (selain role yang sedang diedit)
    const checkExisting = await client.query(
      `SELECT id FROM tbl_role WHERE LOWER(role) = LOWER($1) AND id != $2`,
      [role, id]
    );
    
    if (checkExisting.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Role dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }
    
    await client.query(
      `UPDATE tbl_role SET 
        role = $1,
        updated_at = NOW()
      WHERE id = $2`,
      [role, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Role berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update role error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}