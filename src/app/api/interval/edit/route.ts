import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function PUT(request: Request) {
  try {
    const { id, id_stage_previous, id_stage_next, interval, keterangan } = await request.json();

    // Validasi input
    if (!id || !id_stage_previous || !id_stage_next || !interval) {
      return NextResponse.json(
        { success: false, message: "Field id, id_stage_previous, id_stage_next, dan interval wajib diisi" },
        { status: 400 }
      );
    }

    if (id_stage_previous === id_stage_next) {
      return NextResponse.json(
        { success: false, message: "Stage previous dan stage next tidak boleh sama" },
        { status: 400 }
      );
    }

    if (interval <= 0) {
      return NextResponse.json(
        { success: false, message: "Interval harus lebih dari 0" },
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

      // Cek apakah stage previous dan next ada
      const stageCheck = await client.query(
        "SELECT id FROM public.tbl_stage WHERE id IN ($1, $2)",
        [id_stage_previous, id_stage_next]
      );

      if (stageCheck.rows.length !== 2) {
        return NextResponse.json(
          { success: false, message: "Stage previous atau stage next tidak ditemukan" },
          { status: 400 }
        );
      }

      // Cek apakah kombinasi stage previous dan next sudah ada (kecuali untuk record yang sedang diedit)
      const duplicateCheck = await client.query(
        "SELECT id FROM public.tbl_interval_stage WHERE id_stage_previous = $1 AND id_stage_next = $2 AND id != $3",
        [id_stage_previous, id_stage_next, id]
      );

      if (duplicateCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: "Kombinasi stage previous dan stage next sudah ada" },
          { status: 400 }
        );
      }

      // Update data
      const result = await client.query(
        `UPDATE public.tbl_interval_stage 
         SET id_stage_previous = $1, id_stage_next = $2, interval = $3, keterangan = $4, updated_at = NOW() 
         WHERE id = $5 
         RETURNING *`,
        [id_stage_previous, id_stage_next, interval, keterangan || null, id]
      );

      return NextResponse.json({
        success: true,
        message: "Interval stage berhasil diperbarui",
        data: result.rows[0],
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