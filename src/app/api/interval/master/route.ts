import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 10;
  const offset = (page - 1) * perPage;

  // Ambil parameter sort dan search
  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = searchParams.get("sortOrder")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // Validasi kolom yang boleh disort untuk interval stage
  const validSortFields = ["id", "stage_previous_name", "stage_next_name", "interval", "created_at"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  
  const client = await getPool().connect();
  try {
    // WHERE clause & params
    let whereClause = "";
    const searchParams_values: unknown[] = [];

    // Cek apakah search tidak kosong setelah trim
    if (search && search.length > 0) {
      whereClause = `WHERE (LOWER(sp.stage) LIKE $1 OR LOWER(sn.stage) LIKE $1 OR LOWER(i.keterangan) LIKE $1)`;
      searchParams_values.push(`%${search}%`);
    }

    // Total count query
    const countQuery = `
      SELECT COUNT(*) FROM public.tbl_interval_stage i
      LEFT JOIN public.tbl_stage sp ON i.id_stage_previous = sp.id
      LEFT JOIN public.tbl_stage sn ON i.id_stage_next = sn.id
      ${whereClause}
    `;
    
    const countResult = await client.query(countQuery, searchParams_values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Main data query dengan JOIN untuk mendapatkan nama stage
    let dataQuery = `
      SELECT 
        i.id, 
        i.id_stage_previous, 
        i.id_stage_next, 
        i.interval, 
        i.keterangan, 
        i.created_at, 
        i.updated_at,
        sp.stage as stage_previous_name,
        sn.stage as stage_next_name
      FROM public.tbl_interval_stage i
      LEFT JOIN public.tbl_stage sp ON i.id_stage_previous = sp.id
      LEFT JOIN public.tbl_stage sn ON i.id_stage_next = sn.id
      ${whereClause}
    `;

    // Handle sorting berdasarkan field yang dipilih
    if (sortField === "stage_previous_name") {
      dataQuery += ` ORDER BY sp.stage ${sortOrder}`;
    } else if (sortField === "stage_next_name") {
      dataQuery += ` ORDER BY sn.stage ${sortOrder}`;
    } else {
      dataQuery += ` ORDER BY i.${sortField} ${sortOrder}`;
    }

    dataQuery += ` LIMIT ${perPage} OFFSET ${offset}`;

    const dataResult = await client.query(dataQuery, searchParams_values);

    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        perPage,
      },
      totalPages, // Untuk kompatibilitas dengan komponen yang ada
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}