import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fullname = formData.get("fullname") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const jabatan = formData.get("jabatan") as string;
    const file = formData.get("photo") as File | null;

    if (!username || !fullname || !email || !password || !role || !jabatan) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah user sudah ada
    const existing = await getPool().query(
      'SELECT id FROM tbl_user WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username atau email sudah digunakan.' },
        { status: 409 }
      );
    }
    
    let photoName: string | null = null;
  
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
  
        const uploadDir = path.join(process.cwd(), "public/images/user");
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  
        const fileExt = file.name.split(".").pop();
        photoName = `${Date.now()}_${username}.${fileExt}`;
        const filePath = path.join(uploadDir, photoName);
  
        await writeFile(filePath, buffer);
      } catch (err) {
        console.error("Error writing file:", err);
        return NextResponse.json({ success: false, message: "Gagal menyimpan file" }, { status: 500 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();
    
    await getPool().query(
      `INSERT INTO tbl_user (username, fullname, email, photo, password, role, jabatan, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [username, fullname, email, photoName, hashedPassword, role, jabatan, createdAt]
    );

    return NextResponse.json(
      { success: true, message: 'User berhasil dibuat.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Gagal membuat user:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
