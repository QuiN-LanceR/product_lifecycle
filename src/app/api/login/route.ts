import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';
import bcrypt from 'bcrypt';
import { generateToken } from "@/utils/auth";

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

  const client = await getPool().connect();
  try {
    // Ambil semua field yang dibutuhkan termasuk fullname
    const result = await client.query(
        `SELECT a.username, a.password, a.fullname, a.email, a.photo, b.role, c.jabatan 
        FROM public.tbl_user as a
        JOIN public.tbl_role as b
        ON a.role = b.id
        JOIN public.tbl_jabatan as c
        ON a.jabatan = c.id
        WHERE username = $1 LIMIT 1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 });
    }

    // Generate JWT token dengan username
    const jwtToken = await generateToken({ username: user.username });

    // Return response tanpa password
    const userResponse = {
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      photo: user.photo,
      role: user.role,
      jabatan: user.jabatan
    };

    const response = NextResponse.json({ 
      success: true, 
      user: userResponse 
    });

    response.cookies.set({
      name: 'token',
      value: jwtToken,
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
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