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

  const client = await pool.connect();
  try {
    const totalResult = await client.query("SELECT COUNT(*) FROM tbl_user");
    const total = parseInt(totalResult.rows[0].count, 10);

    const result = await client.query(
      `SELECT a.id, a.username, a.password, a.fullname, a.email, a.photo, b.role, c.jabatan 
        FROM public.tbl_user as a
        JOIN public.tbl_role as b
        ON a.role = b.id
        JOIN public.tbl_jabatan as c
        ON a.jabatan = c.id
       ORDER BY id ASC LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return NextResponse.json({
      users: result.rows,
      total,
      perPage,
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
}
