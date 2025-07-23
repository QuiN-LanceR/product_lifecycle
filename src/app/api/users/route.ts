import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { verifyToken } from "@/utils/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  try {
    // Ambil token dari cookies
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Token tidak ditemukan" }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token tidak valid" }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // Ambil data user berdasarkan username dari token
      const result = await client.query(
        `SELECT a.username, a.password, a.fullname, a.email, a.photo, b.role, c.jabatan 
        FROM public.tbl_user as a
        JOIN public.tbl_role as b
        ON a.role = b.id
        JOIN public.tbl_jabatan as c
        ON a.jabatan = c.id
        WHERE username = $1 LIMIT 1`,
        [decoded.username]
      );

      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        user: {
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          photo: user.photo,
          role: user.role,
          jabatan: user.jabatan
        }
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
    return NextResponse.json({ success: false, message: "Error server" }, { status: 500 });
  }
}