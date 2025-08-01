import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { id_stage_previous, id_stage_next, interval, keterangan } = await request.json();

    // Validasi input
    if (!id_stage_previous || !id_stage_next || !interval) {
      return NextResponse.json(
        { success: false, message: "Field id_stage_previous, id_stage_next, dan interval wajib diisi" },
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

      // Cek apakah kombinasi stage previous dan next sudah ada
      const existingCheck = await client.query(
        "SELECT id FROM public.tbl_interval_stage WHERE id_stage_previous = $1 AND id_stage_next = $2",
        [id_stage_previous, id_stage_next]
      );

      if (existingCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: "Kombinasi stage previous dan stage next sudah ada" },
          { status: 400 }
        );
      }

      // Insert data baru
      const result = await client.query(
        `INSERT INTO public.tbl_interval_stage 
         (id_stage_previous, id_stage_next, interval, keterangan, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING *`,
        [id_stage_previous, id_stage_next, interval, keterangan || null]
      );

      return NextResponse.json({
        success: true,
        message: "Interval stage berhasil ditambahkan",
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