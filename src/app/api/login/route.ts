import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // atau custom config db
});

export async function POST(req: NextRequest) {
  const { username, password, token: recaptchaToken } = await req.json();
  
  const secret = process.env.RECAPTCHA_SECRET_KEY!;
  const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secret}&response=${recaptchaToken}`,
  });

  const verifyData = await verifyRes.json();

  if (!verifyData.success || verifyData.score < 0.5) {
    return NextResponse.json({ success: false, message: "reCAPTCHA gagal" }, { status: 403 });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM public.tbl_user WHERE username = $1 LIMIT 1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    // bandingkan password (plain atau hash)
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 });
    }

    // Buat JWT token (rename variable untuk menghindari konflik)
    const jwtToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        jabatan: user.jabatan,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ success: true, user });

    response.cookies.set({
      name: 'token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: "Error server" }, { status: 500 });
  } finally {
    client.release();
  }
}