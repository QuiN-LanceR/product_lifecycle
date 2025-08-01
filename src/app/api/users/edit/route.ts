import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const fullname = formData.get("fullname") as string;
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const jabatan = formData.get("jabatan") as string;
  const file = formData.get("photo") as File | null;

  if (!id || !fullname || !email || !username) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
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

  const client = await getPool().connect();
  try {
    await client.query(
      `UPDATE tbl_user SET 
        fullname = $1, 
        email = $2, 
        username = $3,
        role = $4,
        jabatan = $5,
        photo = COALESCE($6, photo),
        updated_at = NOW()
      WHERE id = $7`,
      [fullname, email, username, role, jabatan, photoName, id]
    );

    return NextResponse.json({ 
      success: true,
      message: "Data pengguna berhasil diperbarui"
    });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}