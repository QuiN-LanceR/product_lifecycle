import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 10;
  const offset = (page - 1) * perPage;

  // Ambil parameter sort dan search - perbaiki nama parameter
  const sortBy = searchParams.get("sortBy") || "id"; // Ubah dari "sort_by" ke "sortBy"
  const sortOrder = searchParams.get("sortOrder")?.toUpperCase() === "DESC" ? "DESC" : "ASC"; // Ubah dari "sort_order" ke "sortOrder"
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  // Validasi kolom yang boleh disort - tambahkan prefix tabel
  const validSortFields = ["id", "username", "fullname", "email", "role", "jabatan"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";
  
  // Map sort field ke kolom database yang benar
  const getSortColumn = (field: string) => {
    switch (field) {
      case "role":
        return "b.role";
      case "jabatan":
        return "c.jabatan";
      default:
        return `a.${field}`;
    }
  };

  const client = await getPool().connect();
  try {
    // WHERE clause & params
    let whereClause = "";
    const searchParams_values: unknown[] = [];

    // Cek apakah search tidak kosong setelah trim
    if (search && search.length > 0) {
      whereClause = `WHERE LOWER(a.username) LIKE $1 OR LOWER(a.fullname) LIKE $1 OR LOWER(a.email) LIKE $1`;
      searchParams_values.push(`%${search}%`);
    }

    // Total count query
    const countQuery = `
      SELECT COUNT(*) FROM public.tbl_user as a
      JOIN public.tbl_role as b ON a.role = b.id
      JOIN public.tbl_jabatan as c ON a.jabatan = c.id
      ${whereClause}
    `;
    
    const countResult = await client.query(countQuery, searchParams_values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Main data query dengan parameter yang benar
    const sortColumn = getSortColumn(sortField);
    let dataQuery = `
      SELECT 
        a.id, a.username, a.fullname, a.email, a.photo,
        b.role, c.jabatan 
      FROM public.tbl_user as a
      JOIN public.tbl_role as b ON a.role = b.id
      JOIN public.tbl_jabatan as c ON a.jabatan = c.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
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
      users: result.rows,
      total,
      perPage,
      currentPage: page,
      // Tambahkan info debug untuk membantu troubleshooting
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