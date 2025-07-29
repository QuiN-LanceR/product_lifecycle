import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 10;
  const offset = (page - 1) * perPage;

  // Ambil parameter sort dan search
  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = searchParams.get("sortOrder")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // Validasi kolom yang boleh disort untuk segmens
  const validSortFields = ["id", "segmen", "created_at"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  
  const client = await pool.connect();
  try {
    // WHERE clause & params
    let whereClause = "";
    const searchParams_values: unknown[] = [];

    // Cek apakah search tidak kosong setelah trim
    if (search && search.length > 0) {
      whereClause = `WHERE LOWER(segmen) LIKE $1`;
      searchParams_values.push(`%${search}%`);
    }

    // Total count query
    const countQuery = `
      SELECT COUNT(*) FROM public.tbl_segmen
      ${whereClause}
    `;
    
    const countResult = await client.query(countQuery, searchParams_values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Main data query
    let dataQuery = `
      SELECT id, segmen, icon_light, icon_dark, created_at, updated_at
      FROM public.tbl_segmen
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
    `;

    // Tambahkan parameter untuk LIMIT dan OFFSET
    const queryParams: unknown[] = [...searchParams_values];
    
    if (searchParams_values.length > 0) {
      dataQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    } else {
      dataQuery += ` LIMIT $1 OFFSET $2`;
    }
    
    queryParams.push(perPage, offset);

    const result = await client.query(dataQuery, queryParams);

    return NextResponse.json({
      segmens: result.rows,
      total,
      perPage,
      currentPage: page,
      debug: {
        search: search || null,
        sortBy: sortField,
        sortOrder,
        hasSearch: search.length > 0
      }
    });
  } catch (err) {
    console.error("Database Error:", err);
    return NextResponse.json({ 
      error: "Server Error", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  } finally {
    client.release();
  }
}