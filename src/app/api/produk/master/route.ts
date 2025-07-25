import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 9;
  const offset = (page - 1) * perPage;

  const sortBy = searchParams.get("sortBy") || "id";
  const sortOrder = searchParams.get("sortOrder")?.toUpperCase() === "DESC" ? "DESC" : "ASC";
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  const validSortFields = ["id", "produk", "kategori", "segmen", "stage", "harga", "tanggal_launch"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "id";

  const client = await pool.connect();
  try {
    let whereClause = "";
    const searchParams_values: unknown[] = [];

    if (search && search.length > 0) {
      whereClause = `WHERE LOWER(produk) LIKE $1 OR LOWER(deskripsi) LIKE $1 OR LOWER(kategori) LIKE $1 OR LOWER(segmen) LIKE $1`;
      searchParams_values.push(`%${search}%`);
    }

    const countQuery = `
      SELECT COUNT(*) FROM public.tbl_produk
      ${whereClause}
    `;
    
    const countResult = await client.query(countQuery, searchParams_values);
    const total = parseInt(countResult.rows[0].count, 10);

    let dataQuery = `
      SELECT 
        id, produk, deskripsi, kategori, segmen, stage, harga, 
        tanggal_launch, pelanggan, created_at, updated_at
      FROM public.tbl_produk
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
    `;

    const queryParams: unknown[] = [...searchParams_values];
    
    if (searchParams_values.length > 0) {
      dataQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    } else {
      dataQuery += ` LIMIT $1 OFFSET $2`;
    }
    
    queryParams.push(perPage, offset);

    const result = await client.query(dataQuery, queryParams);

    // Ambil attachment untuk setiap produk
    const products = result.rows;
    for (const product of products) {
      const attachmentQuery = `
        SELECT id, nama_attachment, url_attachment, size, type, created_at, updated_at
        FROM public.tbl_attachment_produk
        WHERE produk_id = $1
      `;
      const attachmentResult = await client.query(attachmentQuery, [product.id]);
      product.attachments = attachmentResult.rows;
    }

    return NextResponse.json({
      products: products,
      total,
      perPage,
      currentPage: page
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