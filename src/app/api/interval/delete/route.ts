import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID interval stage wajib diisi" },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
    try {
      // Cek apakah interval stage ada
      const existingCheck = await client.query(
        "SELECT id FROM public.tbl_interval_stage WHERE id = $1",
        [id]
      );

      if (existingCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Interval stage tidak ditemukan" },
          { status: 404 }
        );
      }

      // Hapus data
      await client.query(
        "DELETE FROM public.tbl_interval_stage WHERE id = $1",
        [id]
      );

      return NextResponse.json({
        success: true,
        message: "Interval stage berhasil dihapus",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}